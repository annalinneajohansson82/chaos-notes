import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeFamily = 'default' | 'dracula';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'chaos-notes-theme';
  private readonly FAMILY_STORAGE_KEY = 'chaos-notes-theme-family';

  private darkSubject = new BehaviorSubject<boolean>(this.loadPreference());
  isDark$ = this.darkSubject.asObservable();

  private themeFamilySubject = new BehaviorSubject<ThemeFamily>(this.loadFamilyPreference());
  themeFamily$ = this.themeFamilySubject.asObservable();

  constructor() {
    this.applyTheme(this.darkSubject.value);
    this.applyThemeFamily(this.themeFamilySubject.value);
  }

  toggle(): void {
    const next = !this.darkSubject.value;
    this.darkSubject.next(next);
    this.applyTheme(next);
    localStorage.setItem(this.STORAGE_KEY, String(next));
  }

  get isDark(): boolean {
    return this.darkSubject.value;
  }

  get themeFamily(): ThemeFamily {
    return this.themeFamilySubject.value;
  }

  setThemeFamily(family: ThemeFamily): void {
    this.themeFamilySubject.next(family);
    this.applyThemeFamily(family);
    localStorage.setItem(this.FAMILY_STORAGE_KEY, family);
  }

  private loadPreference(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private loadFamilyPreference(): ThemeFamily {
    const stored = localStorage.getItem(this.FAMILY_STORAGE_KEY);
    return stored === 'dracula' ? 'dracula' : 'default';
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('wa-dark', dark);
  }

  private applyThemeFamily(family: ThemeFamily): void {
    document.documentElement.classList.toggle('theme-dracula', family === 'dracula');
  }
}
