import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SettingsService } from '../settings.service';
import { ThemeService, ThemeFamily } from '../shared/theme.service';
import { DEFAULT_SETTINGS, Settings } from '../db';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

@Component({
  selector: 'app-settings',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="s-root">
      <header class="s-header">
        <wa-button appearance="plain" (click)="back()">← Back</wa-button>
        <span class="s-title">Settings</span>
      </header>

      @if (saved()) {
        <p class="s-saved">Saved.</p>
      }

      <form class="s-form" (submit)="save($event)">
        <section class="s-section">
          <h2 class="s-section-label">Theme</h2>
          <div class="s-theme-picker">
            <button
              type="button"
              class="s-theme-btn"
              [class.s-theme-btn--active]="themeFamily() === 'default'"
              (click)="selectTheme('default')"
            >Default</button>
            <button
              type="button"
              class="s-theme-btn s-theme-btn--dracula"
              [class.s-theme-btn--active]="themeFamily() === 'dracula'"
              (click)="selectTheme('dracula')"
            >Dracula</button>
          </div>
        </section>

        <section class="s-section">
          <h2 class="s-section-label">Now soft-limit</h2>
          <wa-input
            type="number"
            label="Max items in Now before nudge"
            [value]="draft.nowSoftLimit"
            (wa-input)="draft.nowSoftLimit = +$any($event).target.value"
            min="1"
          ></wa-input>
        </section>

        <section class="s-section">
          <h2 class="s-section-label">Archive retention (days)</h2>
          <wa-input
            type="number"
            label="Days before archived items are deleted"
            [value]="draft.archiveRetentionDays"
            (wa-input)="draft.archiveRetentionDays = +$any($event).target.value"
            min="1"
          ></wa-input>
        </section>

        <section class="s-section">
          <h2 class="s-section-label">Fuzzy count labels</h2>
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
    </div>
  `,
  styles: [`
    .s-root {
      min-height: 100vh;
      background: var(--wa-color-surface-default);
      color: var(--wa-color-text-normal);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 24px 100px;
    }
    .s-header {
      width: 100%;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 40px;
    }
    .s-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--wa-color-text-quiet);
    }
    .s-form {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .s-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .s-section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--wa-color-text-quiet);
      margin: 0;
    }
    .s-saved {
      color: var(--wa-color-text-quiet);
      font-size: 12px;
      margin-bottom: 8px;
    }
    .s-theme-picker {
      display: flex;
      gap: 8px;
    }
    .s-theme-btn {
      padding: 6px 16px;
      border-radius: 6px;
      border: 1px solid var(--wa-color-border-quiet);
      background: var(--wa-color-surface-default);
      color: var(--wa-color-text-normal);
      font-size: 13px;
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .s-theme-btn:hover {
      border-color: var(--wa-color-text-quiet);
    }
    .s-theme-btn--active {
      border-color: var(--wa-color-brand-fill-loud);
      background: var(--wa-color-fill-quiet);
    }
  `],
})
export class SettingsComponent {
  private settingsService = inject(SettingsService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  saved = signal(false);
  themeFamily = toSignal(this.themeService.themeFamily$, { requireSync: true });

  draft: Settings = structuredClone(DEFAULT_SETTINGS);

  constructor() {
    this.settingsService.settings$.pipe(takeUntilDestroyed()).subscribe(s => {
      this.draft = structuredClone(s);
    });
  }

  async save(event: Event): Promise<void> {
    event.preventDefault();
    await this.settingsService.save({
      nowSoftLimit: this.draft.nowSoftLimit,
      archiveRetentionDays: this.draft.archiveRetentionDays,
      fuzzyLabels: { ...this.draft.fuzzyLabels },
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  selectTheme(family: ThemeFamily): void {
    this.themeService.setThemeFamily(family);
  }

  back(): void {
    this.router.navigate(['/']);
  }
}
