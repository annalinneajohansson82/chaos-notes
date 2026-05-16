import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../shared/theme.service';
import { MOCK_NOW_TASKS, MOCK_SOON_TASKS, MockTask, getFuzzyLabel } from './mock-data';

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="va-root">
      <header class="va-header">
        <span class="va-app-name">Chaos Notes</span>
        <button
          class="va-theme-btn"
          (click)="toggleTheme()"
          [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ isDark ? '☀' : '☾' }}
        </button>
      </header>

      <main class="va-main">
        <div class="va-capture-row">
          <input
            class="va-capture"
            type="text"
            placeholder="what's on your mind?"
            [(ngModel)]="captureValue"
            (keydown.enter)="capture()"
            autofocus
            aria-label="Quick capture"
          />
        </div>

        <section class="va-now-section" aria-label="Now tasks">
          <h2 class="va-tier-label">NOW</h2>
          <ul class="va-task-list">
            @for (task of nowTasks; track task.id) {
              <li class="va-task-item" [class.va-task-done]="task.done">
                <input
                  type="checkbox"
                  class="va-checkbox"
                  [checked]="task.done"
                  (change)="complete(task)"
                  [attr.aria-label]="'Complete: ' + task.title"
                />
                <span class="va-task-title">{{ task.title }}</span>
              </li>
            }
          </ul>
        </section>

        <div class="va-soon-row">
          <button
            class="va-soon-toggle"
            (click)="soonExpanded = !soonExpanded"
            [attr.aria-expanded]="soonExpanded"
          >
            <span class="va-soon-arrow">{{ soonExpanded ? '▾' : '▸' }}</span>
            Soon — {{ soonLabel }}
          </button>
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

      .va-theme-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: var(--wa-color-text-quiet);
        padding: 4px;
        line-height: 1;
      }
      .va-theme-btn:hover {
        color: var(--wa-color-text-normal);
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
        background: none;
        border: none;
        border-bottom: 1.5px solid var(--wa-color-neutral-border-normal);
        outline: none;
        font-size: 18px;
        color: var(--wa-color-text-normal);
        padding: 8px 0;
        box-sizing: border-box;
      }
      .va-capture::placeholder {
        color: var(--wa-color-text-quiet);
      }
      .va-capture:focus {
        border-bottom-color: var(--wa-color-brand-border-normal);
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
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 8px;
        border-left: 3px solid transparent;
        margin-left: -11px;
        transition: border-color 0.15s;
      }
      .va-task-item:hover {
        border-left-color: var(--wa-color-brand-border-normal);
      }

      .va-checkbox {
        margin-top: 3px;
        cursor: pointer;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        accent-color: var(--wa-color-brand-fill-normal);
      }

      .va-task-title {
        font-size: 15px;
        line-height: 1.5;
        transition:
          opacity 0.3s,
          text-decoration 0.3s;
      }

      .va-task-done .va-task-title {
        text-decoration: line-through;
        opacity: 0.4;
      }

      .va-soon-row {
        margin-top: 40px;
      }

      .va-soon-toggle {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 13px;
        color: var(--wa-color-text-quiet);
        padding: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .va-soon-toggle:hover {
        color: var(--wa-color-text-normal);
      }

      .va-soon-arrow {
        font-size: 11px;
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
  nowTasks: MockTask[] = MOCK_NOW_TASKS.map((t) => ({ ...t }));
  soonTasks: MockTask[] = MOCK_SOON_TASKS;
  soonExpanded = false;
  captureValue = '';

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
    if (!this.captureValue.trim()) return;
    this.captureValue = '';
  }
}
