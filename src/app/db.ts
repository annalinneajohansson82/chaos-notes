import Dexie, { Table } from 'dexie';
import { InjectionToken } from '@angular/core';

export const DB_NAME = new InjectionToken<string>('ChaosDbName');

export type UrgencyTier = 'now' | 'soon' | 'later' | 'someday';

export interface Note {
  id: string;
  title: string;
  body: string | null;
  urgency_tier: UrgencyTier | null;
  done: boolean;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
  dirty: boolean;
}

export interface NoteRelation {
  id: string;
  note_id: string;
  task_id: string;
  created_at: Date;
}

export class ChaosDb extends Dexie {
  notes!: Table<Note, string>;
  note_relations!: Table<NoteRelation, string>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      notes: 'id, urgency_tier, done, archived_at, dirty',
      note_relations: 'id, note_id, task_id',
    });
  }
}
