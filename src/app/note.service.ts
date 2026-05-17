import { Injectable, Inject, Optional } from '@angular/core';
import { Observable, Subject, from, startWith, switchMap } from 'rxjs';
import { ChaosDb, DB_NAME, IDB_OPTIONS, Note, UrgencyTier } from './db';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly db: ChaosDb;
  private readonly _refresh = new Subject<void>();

  constructor(
    @Optional() @Inject(DB_NAME) name: string | null,
    @Optional() @Inject(IDB_OPTIONS) idbOptions?: { indexedDB: IDBFactory; IDBKeyRange: typeof IDBKeyRange },
  ) {
    this.db = new ChaosDb(name ?? 'chaos-notes', idbOptions ?? undefined);
  }

  getAll(): Promise<Note[]> {
    return this.db.notes.toArray();
  }

  getByTier(tier: UrgencyTier): Promise<Note[]> {
    return this.db.notes.where('urgency_tier').equals(tier)
      .filter(n => n.archived_at === null)
      .toArray();
  }

  watchByTier(tier: UrgencyTier): Observable<Note[]> {
    return this._refresh.pipe(
      startWith(null),
      switchMap(() => from(this.getByTier(tier))),
    );
  }

  watchUncategorized(): Observable<Note[]> {
    return this._refresh.pipe(
      startWith(null),
      switchMap(() => from(
        this.db.notes.filter(n => n.urgency_tier === null && n.archived_at === null).toArray()
      )),
    );
  }

  async create(title: string): Promise<Note> {
    const note = await this.persist({ urgency_tier: null, title });
    this._refresh.next();
    return note;
  }

  async createTask(title: string, tier: UrgencyTier): Promise<Note> {
    const note = await this.persist({ urgency_tier: tier, title });
    this._refresh.next();
    return note;
  }

  async update(id: string, patch: Partial<Omit<Note, 'id' | 'created_at'>>): Promise<void> {
    await this.db.notes.update(id, { ...patch, updated_at: new Date(), dirty: true });
    this._refresh.next();
  }

  async softArchive(id: string): Promise<void> {
    await this.db.notes.update(id, { archived_at: new Date(), updated_at: new Date(), dirty: true });
    this._refresh.next();
  }

  async delete(id: string): Promise<void> {
    await this.db.notes.delete(id);
    this._refresh.next();
  }

  private async persist(fields: Pick<Note, 'title' | 'urgency_tier'>): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: crypto.randomUUID(),
      body: null,
      done: false,
      archived_at: null,
      created_at: now,
      updated_at: now,
      dirty: true,
      ...fields,
    };
    await this.db.notes.add(note);
    return note;
  }

  close(): void {
    this.db.close();
  }
}
