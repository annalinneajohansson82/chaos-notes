import { Injectable, Inject } from '@angular/core';
import { Observable, Subject, from, startWith, switchMap } from 'rxjs';
import { CHAOS_DB, ChaosDb, Note, UrgencyTier } from './db';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly _refresh = new Subject<void>();

  constructor(@Inject(CHAOS_DB) private readonly db: ChaosDb) {}

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

  async seedIfEmpty(force = false): Promise<void> {
    const count = await this.db.notes.count();
    if (!force && count > 0) return;
    const now = new Date();
    const make = (title: string, urgency_tier: UrgencyTier | null): Note => ({
      id: crypto.randomUUID(), title, body: null, urgency_tier,
      done: false, archived_at: null, created_at: now, updated_at: now, dirty: true,
    });
    await this.db.notes.bulkAdd([
      make('Reply to dentist appointment email', 'now'),
      make('Pick up milk on the way home', 'now'),
      make('Send invoice to client', 'now'),
      make('Book train tickets for next month', 'soon'),
      make('Finish reading that book', 'soon'),
      make('Look into noise-cancelling headphones', 'soon'),
      make('Call mum back', 'soon'),
      make('Reorganise bookshelf', 'later'),
      make('Learn a new recipe', 'later'),
      make('Take a pottery class', 'someday'),
      make('Plan a weekend trip', 'someday'),
      make('The meeting felt weird — write it down properly later', null),
      make('Maybe try a standing desk?', null),
    ]);
    this._refresh.next();
  }

  close(): void {
    this.db.close();
  }
}
