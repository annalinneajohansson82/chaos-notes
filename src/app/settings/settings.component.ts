import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SettingsService } from '../settings.service';
import { DEFAULT_SETTINGS, Settings } from '../db';
import { SettingsFormComponent } from './settings-form.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SettingsFormComponent],
  template: `
    <div class="s-root">
      <header class="s-header">
        <span class="s-title">Settings</span>
      </header>

      <div class="s-content">
        <app-settings-form 
          [settings]="settings()" 
          (save)="saveSettings($event)"
        ></app-settings-form>
      </div>
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
      margin-bottom: 40px;
    }
    .s-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--wa-color-text-quiet);
    }
    .s-content {
      width: 100%;
      max-width: 480px;
    }
  `],
})
export class SettingsComponent {
  private settingsService = inject(SettingsService);

  settings = toSignal(this.settingsService.settings$, { initialValue: DEFAULT_SETTINGS });

  async saveSettings(patch: Partial<Settings>): Promise<void> {
    await this.settingsService.save(patch);
  }
}
