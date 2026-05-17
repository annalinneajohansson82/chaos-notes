import Dexie, { Table } from 'dexie';
import { InjectionToken } from '@angular/core';

export const DB_NAME = new InjectionToken<string>('ChaosDbName');
export const IDB_OPTIONS = new InjectionToken<{ indexedDB: IDBFactory; IDBKeyRange: typeof IDBKeyRange } | undefined>('IdbOptions');

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

export interface FuzzyLabels {
  one: string;
  couple: string;
  few: string;
  quiteFew: string;
  many: string;
}

export interface Settings {
  id: 'singleton';
  fuzzyLabels: FuzzyLabels;
  nowSoftLimit: number;
  archiveRetentionDays: number;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  fuzzyLabels: {
    one: 'just one thing',
    couple: 'a couple things',
    few: 'a few things',
    quiteFew: 'quite a few things',
    many: 'many things',
  },
  nowSoftLimit: 5,
  archiveRetentionDays: 30,
};

export class ChaosDb extends Dexie {
  notes!: Table<Note, string>;
  settings!: Table<Settings, string>;

  constructor(name: string, idbOptions?: { indexedDB: IDBFactory; IDBKeyRange: typeof IDBKeyRange }) {
    super(name, idbOptions);
    this.version(1).stores({
      notes: 'id, urgency_tier, done, archived_at, dirty',
      note_relations: 'id, note_id, task_id',
    });
    this.version(2).stores({
      settings: 'id',
    });
    this.version(3).stores({
      note_relations: null,
    });
  }
}

export const CHAOS_DB = new InjectionToken<ChaosDb>('ChaosDb');
