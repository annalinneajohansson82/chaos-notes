import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter, HostListener, ElementRef, inject } from '@angular/core';
import { Note, UrgencyTier } from '../../db';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/tooltip/tooltip.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';

@Component({
  selector: 'app-note-item',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <li class="va-note-item" [class.va-note-selected]="selected" (focusout)="onFocusOut($event)">
      <div class="va-note-row">
        <span
          class="va-title"
          tabindex="0"
          role="button"
          (click)="onTitleClick()"
          (dblclick)="enterEdit()"
          (keydown.enter)="enterEdit()"
          (keydown.space)="onTitleSpace($event)"
        >{{ note.title }}</span>
        <wa-tooltip content="Edit">
          <wa-icon class="va-edit-hint" name="pen-to-square" variant="regular" aria-hidden="true" (click)="enterEdit()"></wa-icon>
        </wa-tooltip>
      </div>

      @if (editing) {
        <div class="va-edit-section">
          <wa-input
            class="va-title-input"
            [value]="note.title"
            (wa-blur)="commitTitle($event)"
            (keydown.enter)="commitTitle($event)"
            (keydown.escape)="editing = false"
            autofocus
          ></wa-input>
          <div class="va-tier-row">
            <wa-select
              class="va-tier-select"
              [value]="note.urgency_tier ?? ''"
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
        </div>
      }
    </li>
  `,
  styles: [`
    :host { display: contents; }

    .va-note-item {
      padding: var(--wa-space-m) var(--wa-space-xs);
      margin-bottom: var(--wa-space-m);
      border: 1px solid transparent;
      border-radius: var(--wa-border-radius-m);
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        color 0.15s ease;
    }
    .va-note-item:hover,
    .va-note-item:focus-within,
    .va-note-item.va-note-selected {
      background-color: var(--wa-color-fill-quiet);
      border-color: var(--wa-color-border-quiet);
      color: var(--wa-color-on-quiet);
      box-shadow: var(--wa-shadow-m);
    }

    .va-note-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .va-title {
      flex: 1;
      cursor: pointer;
      font-size: 14px;
      outline: none;
      border-radius: var(--wa-border-radius-s);
    }
    .va-title:focus-visible {
      outline: 2px solid var(--wa-color-brand-fill-loud);
      outline-offset: 2px;
    }

    .va-edit-hint {
      flex-shrink: 0;
      font-size: 14px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .va-note-item:hover .va-edit-hint,
    .va-note-item:focus-within .va-edit-hint,
    .va-note-item.va-note-selected .va-edit-hint {
      opacity: 1;
    }

    .va-title-input {
      flex: 1;
      --wa-input-border-width: 0 0 1px 0;
      --wa-input-background-color: transparent;
      --wa-input-font-size: 14px;
      font-size: 14px;
    }

    .va-edit-section {
      display: flex;
      flex-direction: column;
      gap: var(--wa-space-s);
    }

    .va-tier-row {
      display: flex;
      justify-content: flex-start;
    }

    .va-tier-select {
      width: 90px;
      --wa-select-font-size: 11px;
      --wa-select-background-color: transparent;
      --wa-select-border-width: 0;
      --wa-select-color: var(--wa-color-text-quiet);
    }
  `],
})
export class NoteItemComponent {
  @Input({ required: true }) note!: Note;
  @Output() titleChange = new EventEmitter<string>();
  @Output() tierChange = new EventEmitter<UrgencyTier | null>();

  private el = inject(ElementRef);

  editing = false;
  selected = false;

  @HostListener('document:mousedown', ['$event'])
  onDocumentMousedown(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.editing = false;
      this.selected = false;
    }
  }

  onTitleClick(): void {
    this.selected = true;
  }

  enterEdit(): void {
    this.selected = false;
    this.editing = true;
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('.va-title-input') as HTMLElement | null;
      input?.focus();
    });
  }

  onTitleSpace(event: Event): void {
    event.preventDefault();
    this.enterEdit();
  }

  commitTitle(event: Event): void {
    this.editing = false;
    const value = ((event.target as any).value as string | undefined)?.trim() ?? '';
    if (value && value !== this.note.title) {
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
      this.selected = false;
    }
  }
}
