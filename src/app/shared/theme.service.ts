import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'chaos-notes-theme';
  private darkSubject = new BehaviorSubject<boolean>(this.loadPreference());
  isDark$ = this.darkSubject.asObservable();

  constructor() {
    this.applyTheme(this.darkSubject.value);
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

  private loadPreference(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('wa-dark', dark);
  }
}
