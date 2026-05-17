import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SettingsService } from './settings.service';
import { CHAOS_DB, ChaosDb, DEFAULT_SETTINGS } from './db';

describe('SettingsService', () => {
  let service: SettingsService;
  let sharedIdbOptions: { indexedDB: IDBFactory; IDBKeyRange: typeof IDBKeyRange };
  let dbName: string;

  beforeEach(() => {
    dbName = `settings-test-${crypto.randomUUID()}`;
    sharedIdbOptions = { indexedDB: new IDBFactory(), IDBKeyRange };
    TestBed.configureTestingModule({
      providers: [{ provide: CHAOS_DB, useValue: new ChaosDb(dbName, sharedIdbOptions) }],
    });
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    service.close();
    TestBed.resetTestingModule();
  });

  it('settings$ emits defaults when no settings exist', async () => {
    const settings = await firstValueFrom(service.settings$);
    expect(settings.nowSoftLimit).toBe(DEFAULT_SETTINGS.nowSoftLimit);
    expect(settings.archiveRetentionDays).toBe(DEFAULT_SETTINGS.archiveRetentionDays);
    expect(settings.fuzzyLabels).toEqual(DEFAULT_SETTINGS.fuzzyLabels);
  });

  it('save patches a setting and settings$ emits the updated value', async () => {
    await firstValueFrom(service.settings$);
    await service.save({ nowSoftLimit: 3 });
    const updated = await firstValueFrom(service.settings$);
    expect(updated.nowSoftLimit).toBe(3);
  });

  it('saved settings are loaded by a new instance on the same database', async () => {
    await firstValueFrom(service.settings$);
    await service.save({ archiveRetentionDays: 7 });
    service.close();
    TestBed.resetTestingModule();

    // Same dbName and sharedIdbOptions — same in-memory database
    TestBed.configureTestingModule({
      providers: [{ provide: CHAOS_DB, useValue: new ChaosDb(dbName, sharedIdbOptions) }],
    });
    const service2 = TestBed.inject(SettingsService);
    const loaded = await firstValueFrom(service2.settings$);
    expect(loaded.archiveRetentionDays).toBe(7);
    service2.close();
  });
});
