import { Injectable, Inject, Optional } from '@angular/core';
import { Observable, from } from 'rxjs';
import { liveQuery } from 'dexie';
import { ChaosDb, DB_NAME, Note, UrgencyTier } from './db';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly db: ChaosDb;

  constructor(@Optional() @Inject(DB_NAME) name: string | null) {
    this.db = new ChaosDb(name ?? 'chaos-notes');
  }

  getAll(): Promise<Note[]> {
    return this.db.notes.toArray();
  }

  getByTier(tier: UrgencyTier): Promise<Note[]> {
    return this.db.notes.where('urgency_tier').equals(tier).toArray();
  }

  watchByTier(tier: UrgencyTier): Observable<Note[]> {
    return from(liveQuery(() => this.db.notes.where('urgency_tier').equals(tier).toArray()));
  }

  async create(title: string): Promise<Note> {
    return this.persist({ urgency_tier: null, title });
  }

  async createTask(title: string, tier: UrgencyTier): Promise<Note> {
    return this.persist({ urgency_tier: tier, title });
  }

  delete(id: string): Promise<void> {
    return this.db.notes.delete(id);
  }

  async softArchive(id: string): Promise<void> {
    await this.db.notes.update(id, { archived_at: new Date(), updated_at: new Date(), dirty: true });
  }

  async update(id: string, patch: Partial<Omit<Note, 'id' | 'created_at'>>): Promise<void> {
    await this.db.notes.update(id, { ...patch, updated_at: new Date(), dirty: true });
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
