import { Injectable, Inject, Optional } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { ChaosDb, DB_NAME, DEFAULT_SETTINGS, IDB_OPTIONS, Settings } from './db';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly db: ChaosDb;
  private readonly _subject = new ReplaySubject<Settings>(1);

  readonly settings$: Observable<Settings> = this._subject.asObservable();

  constructor(
    @Optional() @Inject(DB_NAME) name: string | null,
    @Optional() @Inject(IDB_OPTIONS) idbOptions?: { indexedDB: IDBFactory; IDBKeyRange: typeof IDBKeyRange },
  ) {
    this.db = new ChaosDb(name ?? 'chaos-notes', idbOptions ?? undefined);
    this.loadAndInit();
  }

  private async loadAndInit(): Promise<void> {
    const existing = await this.db.settings.get('singleton');
    if (!existing) {
      await this.db.settings.put(DEFAULT_SETTINGS);
    }
    this._subject.next(existing ?? DEFAULT_SETTINGS);
  }

  async save(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
    const current = (await this.db.settings.get('singleton')) ?? DEFAULT_SETTINGS;
    const updated: Settings = { ...current, ...patch, id: 'singleton' };
    await this.db.settings.put(updated);
    this._subject.next(updated);
  }

  close(): void {
    this.db.close();
  }
}
