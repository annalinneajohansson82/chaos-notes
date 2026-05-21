import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { vi } from 'vitest';
import { MainViewComponent } from './main-view.component';
import { NoteService } from '../note.service';
import { SettingsService } from '../settings.service';
import { ThemeService } from '../shared/theme.service';
import { DEFAULT_SETTINGS, Note, Settings } from '../db';

// Web Awesome components use ElementInternals (form-associated custom elements).
// Happy-dom does not fully implement it, so we stub attachInternals globally.
const internalsStub = {
  setFormValue: () => {},
  setValidity: () => {},
  reportValidity: () => true,
  checkValidity: () => true,
  validity: { valid: true, valueMissing: false, customError: false },
  customStates: new Map<string, unknown>(),
};
Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
  value: () => internalsStub,
  writable: true,
  configurable: true,
});

function makeNote(overrides: Partial<Note> = {}): Note {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: 'Test task',
    body: null,
    urgency_tier: null,
    done: false,
    archived_at: null,
    created_at: now,
    updated_at: now,
    dirty: false,
    ...overrides,
  };
}

class MockNoteService {
  private nowSubject = new BehaviorSubject<Note[]>([]);
  private soonSubject = new BehaviorSubject<Note[]>([]);
  private laterSubject = new BehaviorSubject<Note[]>([]);
  private somedaySubject = new BehaviorSubject<Note[]>([]);
  private braindumpSubject = new BehaviorSubject<Note[]>([]);

  softArchive = vi.fn().mockResolvedValue(undefined);
  update = vi.fn().mockResolvedValue(undefined);
  create = vi.fn().mockResolvedValue(makeNote());

  setNow(notes: Note[]): void { this.nowSubject.next(notes); }
  setSoon(notes: Note[]): void { this.soonSubject.next(notes); }
  setLater(notes: Note[]): void { this.laterSubject.next(notes); }
  setSomeday(notes: Note[]): void { this.somedaySubject.next(notes); }
  setBraindump(notes: Note[]): void { this.braindumpSubject.next(notes); }

  watchByTier(tier: string): Observable<Note[]> {
    switch (tier) {
      case 'now': return this.nowSubject.asObservable();
      case 'soon': return this.soonSubject.asObservable();
      case 'later': return this.laterSubject.asObservable();
      case 'someday': return this.somedaySubject.asObservable();
      default: return of([]);
    }
  }

  watchUncategorized(): Observable<Note[]> {
    return this.braindumpSubject.asObservable();
  }
}

class MockSettingsService {
  private subject = new BehaviorSubject<Settings>(DEFAULT_SETTINGS);
  settings$ = this.subject.asObservable();
  setSettings(s: Partial<Settings>): void {
    this.subject.next({ ...DEFAULT_SETTINGS, ...s });
  }
}

class MockThemeService {
  isDark = false;
  toggle = vi.fn();
}

describe('MainViewComponent', () => {
  let noteServiceMock: MockNoteService;
  let settingsServiceMock: MockSettingsService;
  let themeServiceMock: MockThemeService;

  beforeEach(async () => {
    noteServiceMock = new MockNoteService();
    settingsServiceMock = new MockSettingsService();
    themeServiceMock = new MockThemeService();

    await TestBed.configureTestingModule({
      imports: [MainViewComponent],
      providers: [
        provideRouter([]),
        { provide: NoteService, useValue: noteServiceMock },
        { provide: SettingsService, useValue: settingsServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
      ],
    }).compileComponents();
  });

  it('braindump notes are rendered using app-task-item elements', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const note = makeNote({ title: 'brain note', urgency_tier: null });
    noteServiceMock.setBraindump([note]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.va-braindump-list app-task-item');
    expect(items.length).toBe(1);
  });

  it('braindump section does not contain app-note-item elements', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const note = makeNote({ urgency_tier: null });
    noteServiceMock.setBraindump([note]);
    fixture.detectChanges();

    const noteItems = fixture.nativeElement.querySelectorAll('app-note-item');
    expect(noteItems.length).toBe(0);
  });

  it('multiple braindump notes are each rendered as app-task-item', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const notes = [makeNote({ title: 'a' }), makeNote({ title: 'b' }), makeNote({ title: 'c' })];
    noteServiceMock.setBraindump(notes);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.va-braindump-list app-task-item');
    expect(items.length).toBe(3);
  });

  it('empty braindump renders no app-task-item elements', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    noteServiceMock.setBraindump([]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.va-braindump-list app-task-item');
    expect(items.length).toBe(0);
  });

  it('completeTask calls noteService.softArchive with the note id', async () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const note = makeNote({ id: 'note-abc', urgency_tier: null });
    noteServiceMock.setBraindump([note]);
    fixture.detectChanges();

    await fixture.componentInstance.completeTask(note);

    expect(noteServiceMock.softArchive).toHaveBeenCalledWith('note-abc');
  });

  it('completeTask calls noteService.softArchive for now-tier tasks', async () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const note = makeNote({ id: 'now-task-1', urgency_tier: 'now' });
    noteServiceMock.setNow([note]);
    fixture.detectChanges();

    await fixture.componentInstance.completeTask(note);

    expect(noteServiceMock.softArchive).toHaveBeenCalledWith('now-task-1');
  });

  it('soonLabel returns "nothing" when there are no soon notes', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    noteServiceMock.setSoon([]);
    fixture.detectChanges();

    expect(fixture.componentInstance.soonLabel).toBe('nothing');
  });

  it('soonLabel returns the "one" fuzzy label for exactly one note', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    noteServiceMock.setSoon([makeNote()]);
    fixture.detectChanges();

    expect(fixture.componentInstance.soonLabel).toBe(DEFAULT_SETTINGS.fuzzyLabels.one);
  });

  it('soonLabel returns the "couple" fuzzy label for two notes', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    noteServiceMock.setSoon([makeNote(), makeNote()]);
    fixture.detectChanges();

    expect(fixture.componentInstance.soonLabel).toBe(DEFAULT_SETTINGS.fuzzyLabels.couple);
  });

  it('soonLabel returns the "few" fuzzy label for three to four notes', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    noteServiceMock.setSoon([makeNote(), makeNote(), makeNote(), makeNote()]);
    fixture.detectChanges();

    expect(fixture.componentInstance.soonLabel).toBe(DEFAULT_SETTINGS.fuzzyLabels.few);
  });

  it('soonLabel returns the "quiteFew" fuzzy label for five to seven notes', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const notes = Array.from({ length: 7 }, () => makeNote());
    noteServiceMock.setSoon(notes);
    fixture.detectChanges();

    expect(fixture.componentInstance.soonLabel).toBe(DEFAULT_SETTINGS.fuzzyLabels.quiteFew);
  });

  it('soonLabel returns the "many" fuzzy label for eight or more notes', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const notes = Array.from({ length: 8 }, () => makeNote());
    noteServiceMock.setSoon(notes);
    fixture.detectChanges();

    expect(fixture.componentInstance.soonLabel).toBe(DEFAULT_SETTINGS.fuzzyLabels.many);
  });

  it('soonLabel reflects custom fuzzy labels from settings', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    settingsServiceMock.setSettings({ fuzzyLabels: { ...DEFAULT_SETTINGS.fuzzyLabels, one: 'just one' } });
    noteServiceMock.setSoon([makeNote()]);
    fixture.detectChanges();

    expect(fixture.componentInstance.soonLabel).toBe('just one');
  });

  it('showNowNudge is false when now count is at the soft limit', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const notes = Array.from({ length: 5 }, () => makeNote({ urgency_tier: 'now' }));
    noteServiceMock.setNow(notes);
    fixture.detectChanges();

    expect(fixture.componentInstance.showNowNudge).toBe(false);
  });

  it('showNowNudge is false when now count is below the soft limit', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const notes = Array.from({ length: 3 }, () => makeNote({ urgency_tier: 'now' }));
    noteServiceMock.setNow(notes);
    fixture.detectChanges();

    expect(fixture.componentInstance.showNowNudge).toBe(false);
  });

  it('showNowNudge is true when now count exceeds the soft limit', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const notes = Array.from({ length: 6 }, () => makeNote({ urgency_tier: 'now' }));
    noteServiceMock.setNow(notes);
    fixture.detectChanges();

    expect(fixture.componentInstance.showNowNudge).toBe(true);
  });

  it('showNowNudge respects a custom nowSoftLimit from settings', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    settingsServiceMock.setSettings({ nowSoftLimit: 2 });
    const notes = [makeNote({ urgency_tier: 'now' }), makeNote({ urgency_tier: 'now' }), makeNote({ urgency_tier: 'now' })];
    noteServiceMock.setNow(notes);
    fixture.detectChanges();

    expect(fixture.componentInstance.showNowNudge).toBe(true);
  });

  it('nudge callout is present in DOM when showNowNudge is true', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const notes = Array.from({ length: 6 }, () => makeNote({ urgency_tier: 'now' }));
    noteServiceMock.setNow(notes);
    fixture.detectChanges();

    const nudge = fixture.nativeElement.querySelector('.va-now-nudge');
    expect(nudge).not.toBeNull();
  });

  it('nudge callout is absent from DOM when showNowNudge is false', () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    noteServiceMock.setNow([]);
    fixture.detectChanges();

    const nudge = fixture.nativeElement.querySelector('.va-now-nudge');
    expect(nudge).toBeNull();
  });

  it('updateTitle calls noteService.update with the new title', async () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const note = makeNote({ id: 'note-xyz' });
    fixture.detectChanges();

    await fixture.componentInstance.updateTitle(note, 'New title');

    expect(noteServiceMock.update).toHaveBeenCalledWith('note-xyz', { title: 'New title' });
  });

  it('updateTier calls noteService.update with the new urgency_tier', async () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const note = makeNote({ id: 'note-xyz' });
    fixture.detectChanges();

    await fixture.componentInstance.updateTier(note, 'soon');

    expect(noteServiceMock.update).toHaveBeenCalledWith('note-xyz', { urgency_tier: 'soon' });
  });

  it('updateTier calls noteService.update with null when tier is cleared', async () => {
    const fixture = TestBed.createComponent(MainViewComponent);
    const note = makeNote({ id: 'note-xyz', urgency_tier: 'now' });
    fixture.detectChanges();

    await fixture.componentInstance.updateTier(note, null);

    expect(noteServiceMock.update).toHaveBeenCalledWith('note-xyz', { urgency_tier: null });
  });
});
