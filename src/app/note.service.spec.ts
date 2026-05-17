import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { NoteService } from './note.service';
import { CHAOS_DB, ChaosDb } from './db';

function chaosDbProvider() {
  return {
    provide: CHAOS_DB,
    useFactory: () => new ChaosDb(`chaos-test-${crypto.randomUUID()}`, { indexedDB: new IDBFactory(), IDBKeyRange }),
  };
}

describe('NoteService', () => {
  let service: NoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [chaosDbProvider()] });
    service = TestBed.inject(NoteService);
  });

  afterEach(() => {
    service.close();
    TestBed.resetTestingModule();
  });

  it('create then getAll returns the note', async () => {
    await service.create('Buy milk');
    const notes = await service.getAll();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Buy milk');
  });

  it('create sets metadata: dirty=true, done=false, archived_at=null, timestamps', async () => {
    const before = new Date();
    const note = await service.create('Test');
    const after = new Date();

    expect(note.dirty).toBe(true);
    expect(note.done).toBe(false);
    expect(note.archived_at).toBeNull();
    expect(note.urgency_tier).toBeNull();
    expect(note.created_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(note.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(note.updated_at.getTime()).toBe(note.created_at.getTime());
    expect(note.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('update patches the note, sets dirty=true and bumps updated_at', async () => {
    const note = await service.create('Original');
    await new Promise(r => setTimeout(r, 5));

    await service.update(note.id, { title: 'Renamed', done: true });

    const [updated] = await service.getAll();
    expect(updated.title).toBe('Renamed');
    expect(updated.done).toBe(true);
    expect(updated.dirty).toBe(true);
    expect(updated.updated_at.getTime()).toBeGreaterThan(note.updated_at.getTime());
  });

  it('softArchive sets archived_at to a date and dirty=true', async () => {
    const note = await service.create('To archive');
    await service.softArchive(note.id);

    const [archived] = await service.getAll();
    expect(archived.archived_at).toBeInstanceOf(Date);
    expect(archived.dirty).toBe(true);
  });

  it('watchByTier excludes soft-archived notes', async () => {
    await service.createTask('Active', 'now');
    const archived = await service.createTask('Archived', 'now');
    await service.softArchive(archived.id);

    const notes = await firstValueFrom(service.watchByTier('now'));
    expect(notes.map(n => n.title)).toEqual(['Active']);
  });

  it('watchUncategorized excludes soft-archived notes', async () => {
    await service.create('Active note');
    const archived = await service.create('Archived note');
    await service.softArchive(archived.id);

    const notes = await firstValueFrom(service.watchUncategorized());
    expect(notes.map(n => n.title)).toEqual(['Active note']);
  });

  it('updating urgency_tier promotes a plain note into the correct tier watch', async () => {
    const note = await service.create('Inbox item');
    await service.update(note.id, { urgency_tier: 'now' });

    const nowNotes = await firstValueFrom(service.watchByTier('now'));
    const uncategorized = await firstValueFrom(service.watchUncategorized());
    expect(nowNotes.map(n => n.title)).toContain('Inbox item');
    expect(uncategorized.map(n => n.title)).not.toContain('Inbox item');
  });

  it('updating urgency_tier to null demotes a task into uncategorized', async () => {
    const task = await service.createTask('Now task', 'now');
    await service.update(task.id, { urgency_tier: null });

    const nowNotes = await firstValueFrom(service.watchByTier('now'));
    const uncategorized = await firstValueFrom(service.watchUncategorized());
    expect(nowNotes.map(n => n.title)).not.toContain('Now task');
    expect(uncategorized.map(n => n.title)).toContain('Now task');
  });

  it('delete removes the note permanently', async () => {
    const note = await service.create('To delete');
    await service.delete(note.id);

    const notes = await service.getAll();
    expect(notes).toHaveLength(0);
  });

  it('getByTier returns only notes with that urgency_tier', async () => {
    await service.create('plain note');
    await service.createTask('Now task', 'now');
    await service.createTask('Soon task', 'soon');

    const nowNotes = await service.getByTier('now');
    expect(nowNotes).toHaveLength(1);
    expect(nowNotes[0].title).toBe('Now task');

    const soonNotes = await service.getByTier('soon');
    expect(soonNotes).toHaveLength(1);
    expect(soonNotes[0].title).toBe('Soon task');
  });
});
