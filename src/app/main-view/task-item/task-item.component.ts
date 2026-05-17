import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter } from '@angular/core';
import { Note, UrgencyTier } from '../../db';
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';

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
          <wa-input
            class="va-title-input"
            [value]="task.title"
            (wa-blur)="commitTitle($event)"
            (keydown.enter)="commitTitle($event)"
            (keydown.escape)="editing = false"
            autofocus
          ></wa-input>
        } @else {
          <span class="va-title" (click)="editing = true">{{ task.title }}</span>
        }
      </div>

      <wa-select
        class="va-tier-select"
        [value]="task.urgency_tier ?? ''"
        (change)="onTierChange($event)"
        aria-label="Urgency tier"
        size="small"
      >
        <wa-option value="">None</wa-option>
        <wa-option value="now">Now</wa-option>
        <wa-option value="soon">Soon</wa-option>
        <wa-option value="later">Later</wa-option>
        <wa-option value="someday">Someday</wa-option>
      </wa-select>
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
      --wa-input-border-width: 0 0 1px 0;
      --wa-input-background-color: transparent;
      --wa-input-font-size: 14px;
      font-size: 14px;
    }

    .va-tier-select {
      display: block;
      margin-top: 4px;
      margin-left: 28px;
      --wa-select-font-size: 11px;
      --wa-select-background-color: transparent;
      --wa-select-border-width: 0;
      --wa-select-color: var(--wa-color-text-quiet);
    }

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
    setTimeout(() => {
      this.complete.emit(this.task);
      this.completing = false;
    }, 500);
  }

  commitTitle(event: Event): void {
    this.editing = false;
    const value = ((event.target as any).value as string | undefined)?.trim() ?? '';
    if (value && value !== this.task.title) {
      this.titleChange.emit(value);
    }
  }

  onTierChange(event: Event): void {
    const value = (event.target as any).value as string;
    this.tierChange.emit(value === '' ? null : value as UrgencyTier);
  }
}
