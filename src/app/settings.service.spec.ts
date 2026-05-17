import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SettingsService } from './settings.service';
import { DB_NAME, DEFAULT_SETTINGS, IDB_OPTIONS } from './db';

describe('SettingsService', () => {
  let service: SettingsService;
  let sharedIdb: { indexedDB: IDBFactory; IDBKeyRange: typeof IDBKeyRange };
  let dbName: string;

  beforeEach(() => {
    dbName = `settings-test-${crypto.randomUUID()}`;
    sharedIdb = { indexedDB: new IDBFactory(), IDBKeyRange };
    TestBed.configureTestingModule({
      providers: [
        { provide: DB_NAME, useValue: dbName },
        { provide: IDB_OPTIONS, useValue: sharedIdb },
      ],
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

    // Same dbName and sharedIdb — same in-memory database
    TestBed.configureTestingModule({
      providers: [
        { provide: DB_NAME, useValue: dbName },
        { provide: IDB_OPTIONS, useValue: sharedIdb },
      ],
    });
    const service2 = TestBed.inject(SettingsService);
    const loaded = await firstValueFrom(service2.settings$);
    expect(loaded.archiveRetentionDays).toBe(7);
    service2.close();
  });
});
