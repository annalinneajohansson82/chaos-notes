import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, signal } from '@angular/core';
import { Settings } from '../db';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (saved()) {
      <p class="sf-saved">Saved.</p>
    }

    <form class="sf-form" (submit)="onSubmit($event)">
      <section class="sf-section">
        <h2 class="sf-section-label">Now soft-limit</h2>
        <wa-input
          type="number"
          label="Max items in Now before nudge"
          [value]="draft.nowSoftLimit"
          (wa-input)="draft.nowSoftLimit = +$any($event).target.value"
          min="1"
        ></wa-input>
      </section>

      <section class="sf-section">
        <h2 class="sf-section-label">Archive retention (days)</h2>
        <wa-input
          type="number"
          label="Days before archived items are deleted"
          [value]="draft.archiveRetentionDays"
          (wa-input)="draft.archiveRetentionDays = +$any($event).target.value"
          min="1"
        ></wa-input>
      </section>

      <section class="sf-section">
        <h2 class="sf-section-label">Fuzzy count labels</h2>
        <wa-input label="1 item" [value]="draft.fuzzyLabels.one"
          (wa-input)="draft.fuzzyLabels.one = $any($event).target.value"></wa-input>
        <wa-input label="2 items" [value]="draft.fuzzyLabels.couple"
          (wa-input)="draft.fuzzyLabels.couple = $any($event).target.value"></wa-input>
        <wa-input label="3–4 items" [value]="draft.fuzzyLabels.few"
          (wa-input)="draft.fuzzyLabels.few = $any($event).target.value"></wa-input>
        <wa-input label="5–7 items" [value]="draft.fuzzyLabels.quiteFew"
          (wa-input)="draft.fuzzyLabels.quiteFew = $any($event).target.value"></wa-input>
        <wa-input label="8+ items" [value]="draft.fuzzyLabels.many"
          (wa-input)="draft.fuzzyLabels.many = $any($event).target.value"></wa-input>
      </section>

      <wa-button type="submit" variant="brand">Save</wa-button>
    </form>
  `,
  styles: [`
    .sf-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .sf-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sf-section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--wa-color-text-quiet);
      margin: 0;
    }
    .sf-saved {
      color: var(--wa-color-text-quiet);
      font-size: 12px;
      margin-bottom: 8px;
    }
  `],
})
export class SettingsFormComponent {
  @Input({ required: true }) settings!: Settings;
  @Output() save = new EventEmitter<Partial<Settings>>();

  saved = signal(false);
  draft!: Settings;

  ngOnInit(): void {
    this.draft = structuredClone(this.settings);
  }

  ngOnChanges(): void {
    if (this.settings) {
      this.draft = structuredClone(this.settings);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.save.emit({
      nowSoftLimit: this.draft.nowSoftLimit,
      archiveRetentionDays: this.draft.archiveRetentionDays,
      fuzzyLabels: { ...this.draft.fuzzyLabels },
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
