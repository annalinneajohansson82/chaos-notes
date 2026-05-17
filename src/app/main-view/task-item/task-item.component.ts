import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter } from '@angular/core';
import { Note, UrgencyTier } from '../../db';
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';

@Component({
  selector: 'app-task-item',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <li class="va-task-item" [class.va-task-completing]="completing">
      <div class="va-task-row">
        <wa-checkbox
          class="va-checkbox"
          [checked]="task.done"
          [disabled]="completing"
          (change)="onCheck()"
          aria-label="Archive"
        ></wa-checkbox>

        @if (editing) {
          <input
            class="va-title-input"
            [value]="task.title"
            (blur)="commitTitle($event)"
            (keydown.enter)="commitTitle($event)"
            (keydown.escape)="editing = false"
            autofocus
          />
        } @else {
          <span class="va-title" (click)="editing = true">{{ task.title }}</span>
        }
      </div>

      <select
        class="va-tier-select"
        [value]="task.urgency_tier ?? ''"
        (change)="onTierChange($event)"
        aria-label="Urgency tier"
      >
        <option value="">None</option>
        <option value="now">Now</option>
        <option value="soon">Soon</option>
        <option value="later">Later</option>
        <option value="someday">Someday</option>
      </select>
    </li>
  `,
  styles: [`
    :host { display: contents; }

    .va-task-item {
      padding: 6px 8px 4px;
      border-left: 3px solid transparent;
      margin-left: -11px;
      transition: border-color 0.15s;
    }
    .va-task-item:hover { border-left-color: currentColor; }

    .va-task-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .va-title {
      flex: 1;
      cursor: text;
      font-size: 14px;
    }

    .va-title-input {
      flex: 1;
      font-size: 14px;
      font-family: inherit;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--wa-color-border-loud);
      outline: none;
      color: inherit;
      padding: 0;
    }

    .va-tier-select {
      display: block;
      margin-top: 4px;
      margin-left: 28px;
      font-size: 11px;
      font-family: inherit;
      color: var(--wa-color-text-quiet);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      appearance: none;
      -webkit-appearance: none;
    }
    .va-tier-select:focus { outline: none; text-decoration: underline; }

    /* Checkbox is disabled during animation to prevent double-fire on the async archive. */
    @keyframes completeSlideUp {
      to { opacity: 0; transform: translateY(-6px); }
    }
    .va-task-completing {
      animation: completeSlideUp 500ms ease forwards;
      pointer-events: none;
    }
  `],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Note;
  @Output() complete = new EventEmitter<Note>();
  @Output() titleChange = new EventEmitter<string>();
  @Output() tierChange = new EventEmitter<UrgencyTier | null>();

  editing = false;
  completing = false;

  onCheck(): void {
    if (this.completing) return;
    this.completing = true;
    setTimeout(() => this.complete.emit(this.task), 500);
  }

  commitTitle(event: Event): void {
    this.editing = false;
    const value = (event.target as HTMLInputElement).value.trim();
    if (value && value !== this.task.title) {
      this.titleChange.emit(value);
    }
  }

  onTierChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.tierChange.emit(value === '' ? null : value as UrgencyTier);
  }
}
