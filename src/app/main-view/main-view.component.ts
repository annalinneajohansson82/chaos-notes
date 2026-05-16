import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { ThemeService } from '../shared/theme.service';
import { MOCK_NOW_TASKS, MOCK_SOON_TASKS, MockTask, getFuzzyLabel } from './mock-data';

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="va-root">
      <header class="va-header">
        <span class="va-app-name">Chaos Notes</span>
        <wa-button
          appearance="plain"
          size="s"
          (click)="toggleTheme()"
          [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <wa-icon [attr.name]="isDark ? 'sun' : 'moon'" variant="regular"></wa-icon>
        </wa-button>
      </header>

      <main class="va-main">
        <div class="va-capture-row">
          <wa-input
            #captureRef
            class="va-capture"
            placeholder="what's on your mind?"
            size="l"
            appearance="outlined"
            (keydown.enter)="capture()"
            autofocus
            aria-label="Quick capture"
          ></wa-input>
        </div>

        <section class="va-now-section" aria-label="Now tasks">
          <h2 class="va-tier-label">NOW</h2>
          <ul class="va-task-list">
            @for (task of nowTasks; track task.id) {
              <li class="va-task-item" [class.va-task-done]="task.done">
                <wa-checkbox
                  [checked]="task.done"
                  (change)="complete(task)"
                  [attr.aria-label]="'Complete: ' + task.title"
                >
                  <span [class.va-task-title-done]="task.done">{{ task.title }}</span>
                </wa-checkbox>
              </li>
            }
          </ul>
        </section>

        <div class="va-soon-row">
          <wa-button
            appearance="plain"
            size="s"
            (click)="soonExpanded = !soonExpanded"
            [attr.aria-expanded]="soonExpanded"
          >
            <wa-icon
              [attr.name]="soonExpanded ? 'chevron-down' : 'chevron-right'"
              variant="regular"
              slot="start"
            ></wa-icon>
            Soon — {{ soonLabel }}
          </wa-button>
          @if (soonExpanded) {
            <ul class="va-soon-list" aria-label="Soon tasks">
              @for (task of soonTasks; track task.id) {
                <li class="va-soon-item">{{ task.title }}</li>
              }
            </ul>
          }
        </div>
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

      .va-capture {
        width: 100%;
      }

      .va-tier-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--wa-color-text-quiet);
        margin: 0 0 16px;
      }

      .va-task-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .va-task-item {
        padding: 4px 8px;
        border-left: 3px solid transparent;
        margin-left: -11px;
        transition: border-color 0.15s;
      }
      .va-task-item:hover {
        border-left-color: var(--wa-color-brand-border-normal);
      }
      .va-task-item.va-task-done {
        opacity: 0.4;
      }

      .va-task-title-done {
        text-decoration: line-through;
      }

      .va-soon-row {
        margin-top: 40px;
      }

      .va-soon-list {
        list-style: none;
        margin: 12px 0 0 20px;
        padding: 0;
      }

      .va-soon-item {
        font-size: 13px;
        color: var(--wa-color-text-quiet);
        padding: 5px 0;
      }
    `,
  ],
})
export class MainViewComponent {
  @ViewChild('captureRef') private captureRef!: ElementRef;

  nowTasks: MockTask[] = MOCK_NOW_TASKS.map((t) => ({ ...t }));
  soonTasks: MockTask[] = MOCK_SOON_TASKS;
  soonExpanded = false;

  get soonLabel(): string {
    return getFuzzyLabel(this.soonTasks.length);
  }

  get isDark(): boolean {
    return this.themeService.isDark;
  }

  constructor(private themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }

  complete(task: MockTask): void {
    task.done = true;
    setTimeout(() => {
      this.nowTasks = this.nowTasks.filter((t) => t.id !== task.id);
    }, 500);
  }

  capture(): void {
    const el = this.captureRef.nativeElement;
    if (!el.value?.trim()) return;
    el.value = '';
  }
}
