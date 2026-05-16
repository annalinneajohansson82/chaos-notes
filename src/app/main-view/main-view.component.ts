import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { ThemeService } from '../shared/theme.service';
import { MOCK_NOW_TASKS, MOCK_SOON_TASKS, MockTask, getFuzzyLabel } from './mock-data';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import '@awesome.me/webawesome/dist/components/details/details.js';

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
          (click)="toggleTheme()"
          [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >{{ isDark ? '☀' : '☾' }}</wa-button>
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
          <ul class="va-task-list">
            @for (task of nowTasks; track task.id) {
              <li class="va-task-item" [class.va-task-done]="task.done">
                <wa-checkbox
                  [checked]="task.done"
                  (change)="complete(task)"
                  [attr.aria-label]="'Complete: ' + task.title"
                >{{ task.title }}</wa-checkbox>
              </li>
            }
          </ul>
        </section>

        <wa-details class="va-soon-row">
          <span slot="summary">Soon — {{ soonLabel }}</span>
          <ul class="va-soon-list" aria-label="Soon tasks">
            @for (task of soonTasks; track task.id) {
              <li class="va-soon-item">{{ task.title }}</li>
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
        background: var(--color-surface, #fff);
        color: var(--color-text, #111);
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
        opacity: 0.5;
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
        opacity: 0.5;
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
        border-left-color: currentColor;
      }
      .va-task-item.va-task-done {
        opacity: 0.4;
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
        opacity: 0.6;
        padding: 5px 0;
      }
    `,
  ],
})
export class MainViewComponent {
  @ViewChild('captureRef') private captureRef!: ElementRef<WaInput>;

  nowTasks: MockTask[] = MOCK_NOW_TASKS.map((t) => ({ ...t }));
  soonTasks: MockTask[] = MOCK_SOON_TASKS;

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
