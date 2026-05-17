import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter, HostListener, ElementRef, inject } from '@angular/core';
import { Note, UrgencyTier } from '../../db';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';

@Component({
  selector: 'app-task-item',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <li class="va-task-item" [class.va-task-completing]="completing" (focusout)="onFocusOut($event)">
      <div class="va-task-row">
        <button
          class="va-checkbox-btn"
          (click)="onCheck()"
          (mouseenter)="hoveringCheckbox = true"
          (mouseleave)="hoveringCheckbox = false"
          (focus)="focusedCheckbox = true"
          (blur)="focusedCheckbox = false"
          [disabled]="completing"
          aria-label="Mark done"
        >
          <wa-icon
            [name]="task.done || hoveringCheckbox || focusedCheckbox ? 'circle-check' : 'circle'"
            variant="regular"
          ></wa-icon>
        </button>

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
          <span class="va-title" (click)="enterEdit()">{{ task.title }}</span>
          <wa-icon class="va-edit-hint" name="pen-to-square" variant="regular" aria-hidden="true" (click)="enterEdit()"></wa-icon>
        }

      </div>

      <div class="va-tier-row" [class.va-tier-row--visible]="editing">
        <wa-select
          class="va-tier-select"
          [value]="task.urgency_tier ?? ''"
          (change)="onTierChange($event)"
          aria-label="Urgency tier"
          size="xs"
        >
          <wa-option value="">None</wa-option>
          <wa-option value="now">Now</wa-option>
          <wa-option value="soon">Soon</wa-option>
          <wa-option value="later">Later</wa-option>
          <wa-option value="someday">Someday</wa-option>
        </wa-select>
      </div>
    </li>
  `,
  styles: [`
    :host { display: contents; }

    .va-task-item {
      padding: var(--wa-space-m) var(--wa-space-xs);
      margin-bottom: var(--wa-space-m);
      margin-left: -11px;
      border: 1px solid transparent;
      border-radius: var(--wa-border-radius-m);
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        color 0.15s ease;
    }
    .va-task-item:hover,
    .va-task-item:focus-within {
      background-color: var(--wa-color-fill-quiet);
      border-color: var(--wa-color-border-quiet);
      color: var(--wa-color-on-quiet);
      box-shadow: var(--wa-shadow-m);
    }

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

    .va-edit-hint {
      flex-shrink: 0;
      font-size: 14px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .va-task-item:hover .va-edit-hint,
    .va-task-item:focus-within .va-edit-hint {
      opacity: 1;
    }

    .va-title-input {
      flex: 1;
      --wa-input-border-width: 0 0 1px 0;
      --wa-input-background-color: transparent;
      --wa-input-font-size: 14px;
      font-size: 14px;
    }

    .va-tier-row {
      padding-left: 28px;
      margin-top: var(--wa-space-2xs);
      display: none;
    }
    .va-tier-row--visible {
      display: block;
    }

    .va-tier-select {
      width: 90px;
      --wa-select-font-size: 11px;
      --wa-select-background-color: transparent;
      --wa-select-border-width: 0;
      --wa-select-color: var(--wa-color-text-quiet);
    }

    .va-checkbox-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }
    .va-checkbox-btn:disabled { cursor: default; }
    .va-checkbox-btn:focus-visible {
      outline: 2px solid var(--wa-color-brand-fill-loud);
      outline-offset: 2px;
      border-radius: 50%;
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

  private el = inject(ElementRef);

  editing = false;
  completing = false;
  hoveringCheckbox = false;
  focusedCheckbox = false;

  @HostListener('document:mousedown', ['$event'])
  onDocumentMousedown(event: MouseEvent): void {
    if (this.editing && !this.el.nativeElement.contains(event.target)) {
      this.editing = false;
    }
  }

  enterEdit(): void {
    this.editing = true;
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('.va-title-input') as HTMLElement | null;
      input?.focus();
    });
  }

  onCheck(): void {
    if (this.completing) return;
    const host = this.el.nativeElement as HTMLElement;
    const wasFocused = host.contains(document.activeElement);
    if (wasFocused) {
      const nextBtn = host.nextElementSibling?.querySelector('.va-checkbox-btn') as HTMLElement | null;
      nextBtn?.focus();
    }
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

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const host = event.currentTarget as Element;
    if (!next || !host.contains(next)) {
      this.editing = false;
    }
  }
}
