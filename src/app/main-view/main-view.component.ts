import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ThemeService } from '../shared/theme.service';
import { NoteService } from '../note.service';
import { SettingsService } from '../settings.service';
import { DEFAULT_SETTINGS, FuzzyLabels, Note, UrgencyTier } from '../db';
import { TaskItemComponent } from './task-item/task-item.component';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/details/details.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';

function getFuzzyLabel(count: number, labels: FuzzyLabels): string {
  if (count === 0) return 'nothing';
  if (count === 1) return labels.one;
  if (count <= 2) return labels.couple;
  if (count <= 4) return labels.few;
  if (count <= 7) return labels.quiteFew;
  return labels.many;
}

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [TaskItemComponent, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="va-root">
      <header class="va-header">
        <span class="va-app-name">Chaos Notes</span>
        <div class="va-header-actions">
          <wa-button appearance="plain" routerLink="/settings" aria-label="Settings">
            <wa-icon name="gear"></wa-icon>
          </wa-button>
          <wa-button
            appearance="plain"
            (click)="toggleTheme()"
            [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <wa-icon [name]="isDark ? 'sun' : 'moon'"></wa-icon>
          </wa-button>
        </div>
      </header>

      <main class="va-main">
        <div class="va-capture-row">
          <wa-input
            #captureRef
            placeholder="what's on your mind?"
            autofocus
            with-clear
            aria-label="Quick capture"
            (keydown.enter)="capture()"
            style="width: 100%"
          ></wa-input>
        </div>

        <section class="va-now-section" aria-label="Now tasks">
          <h2 class="va-tier-label">NOW</h2>
          @if (showNowNudge) {
            <wa-callout class="va-now-nudge">
              <wa-icon slot="icon" name="triangle-exclamation"></wa-icon>
              You've got quite a bit in Now — maybe move something to Soon?
            </wa-callout>
          }
          <ul class="va-task-list">
            @for (note of nowNotes(); track note.id) {
              <app-task-item [task]="note" (complete)="completeTask($event)" (titleChange)="updateTitle(note, $event)" (tierChange)="updateTier(note, $event)" />
            }
          </ul>
        </section>

        <wa-details class="va-soon-row">
          <span slot="summary">Soon ({{ soonLabel }})</span>
          <ul class="va-soon-list" aria-label="Soon tasks">
            @for (note of soonNotes(); track note.id) {
              <app-task-item [task]="note" (complete)="completeTask($event)" (titleChange)="updateTitle(note, $event)" (tierChange)="updateTier(note, $event)" />
            }
          </ul>
        </wa-details>

        <wa-details class="va-later-row">
          <span slot="summary">Later</span>
          <ul class="va-later-list" aria-label="Later tasks">
            @for (note of laterNotes(); track note.id) {
              <app-task-item [task]="note" (complete)="completeTask($event)" (titleChange)="updateTitle(note, $event)" (tierChange)="updateTier(note, $event)" />
            }
          </ul>
        </wa-details>

        <wa-details class="va-someday-row">
          <span slot="summary">Someday</span>
          <ul class="va-someday-list" aria-label="Someday tasks">
            @for (note of somedayNotes(); track note.id) {
              <app-task-item [task]="note" (complete)="completeTask($event)" (titleChange)="updateTitle(note, $event)" (tierChange)="updateTier(note, $event)" />
            }
          </ul>
        </wa-details>

        <wa-details class="va-braindump-row">
          <span slot="summary">Braindump</span>
          <ul class="va-braindump-list" aria-label="Braindump notes">
            @for (note of braindumpNotes(); track note.id) {
              <app-task-item [task]="note" (complete)="completeTask($event)" (titleChange)="updateTitle(note, $event)" (tierChange)="updateTier(note, $event)" />
            }
          </ul>
        </wa-details>
      </main>
    </div>
  `,
  styles: [
    `
      .va-root {
        min-height: 100vh;
        background: var(--wa-color-surface-default);
        color: var(--wa-color-text-normal);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 24px 100px;
      }

      .va-header {
        width: 100%;
        max-width: 480px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 48px;
      }

      .va-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .va-app-name {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--wa-color-text-quiet);
      }

      .va-main {
        width: 100%;
        max-width: 480px;
      }

      .va-capture-row {
        margin-bottom: 48px;
      }

      .va-tier-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--wa-color-text-quiet);
        margin: 0 0 16px;
      }

      .va-now-nudge {
        margin: 0 0 12px;
      }

      .va-task-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .va-soon-row,
      .va-later-row,
      .va-someday-row,
      .va-braindump-row {
        margin-top: 40px;
      }

      .va-soon-list,
      .va-later-list,
      .va-someday-list,
      .va-braindump-list {
        list-style: none;
        margin: 12px 0 0 20px;
        padding: 0;
      }
    `,
  ],
})
export class MainViewComponent {
  @ViewChild('captureRef') private captureRef!: ElementRef<WaInput>;

  private themeService = inject(ThemeService);
  private noteService = inject(NoteService);
  private settingsService = inject(SettingsService);

  settings = toSignal(this.settingsService.settings$, { initialValue: DEFAULT_SETTINGS });
  nowNotes = toSignal(this.noteService.watchByTier('now'), { initialValue: [] as Note[] });
  soonNotes = toSignal(this.noteService.watchByTier('soon'), { initialValue: [] as Note[] });
  laterNotes = toSignal(this.noteService.watchByTier('later'), { initialValue: [] as Note[] });
  somedayNotes = toSignal(this.noteService.watchByTier('someday'), { initialValue: [] as Note[] });
  braindumpNotes = toSignal(this.noteService.watchUncategorized(), { initialValue: [] as Note[] });

  get soonLabel(): string {
    return getFuzzyLabel(this.soonNotes().length, this.settings().fuzzyLabels);
  }

  get showNowNudge(): boolean {
    return this.nowNotes().length > this.settings().nowSoftLimit;
  }

  get isDark(): boolean {
    return this.themeService.isDark;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  async capture(): Promise<void> {
    const el = this.captureRef.nativeElement;
    if (!el.value?.trim()) return;
    await this.noteService.create(el.value.trim());
    el.value = '';
  }

  async completeTask(note: Note): Promise<void> {
    await this.noteService.softArchive(note.id);
  }

  async updateTitle(note: Note, title: string): Promise<void> {
    await this.noteService.update(note.id, { title });
  }

  async updateTier(note: Note, tier: UrgencyTier | null): Promise<void> {
    await this.noteService.update(note.id, { urgency_tier: tier });
  }
}
