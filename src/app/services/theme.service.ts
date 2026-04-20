import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppSettings {
  darkMode: boolean;
  language: string;
  autoRefresh: boolean;
  refreshInterval: number;
  notificationsEnabled: boolean;
  compactView: boolean;
  showTestDurations: boolean;
  defaultTimeout: number;
  maxParallel: number;
  favoritesSuites: string[];
  environment: 'production' | 'staging' | 'development';
}

const DEFAULTS: AppSettings = {
  darkMode: false,
  language: 'es',
  autoRefresh: false,
  refreshInterval: 30,
  notificationsEnabled: true,
  compactView: false,
  showTestDurations: true,
  defaultTimeout: 10000,
  maxParallel: 3,
  favoritesSuites: [],
  environment: 'production'
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'wqts_settings';
  private settings$ = new BehaviorSubject<AppSettings>(this.load());

  getSettings(): Observable<AppSettings> {
    return this.settings$.asObservable();
  }

  get current(): AppSettings {
    return this.settings$.getValue();
  }

  update(partial: Partial<AppSettings>): void {
    const next = { ...this.settings$.getValue(), ...partial };
    this.settings$.next(next);
    localStorage.setItem(this.KEY, JSON.stringify(next));
    this.applyTheme(next.darkMode);
  }

  toggleDarkMode(): void {
    this.update({ darkMode: !this.current.darkMode });
  }

  toggleFavorite(suiteId: string): void {
    const favs = [...this.current.favoritesSuites];
    const idx = favs.indexOf(suiteId);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(suiteId);
    this.update({ favoritesSuites: favs });
  }

  isFavorite(suiteId: string): boolean {
    return this.current.favoritesSuites.includes(suiteId);
  }

  applyTheme(dark: boolean): void {
    document.body.classList.toggle('dark-theme', dark);
  }

  private load(): AppSettings {
    try {
      const raw = localStorage.getItem(this.KEY);
      const saved = raw ? JSON.parse(raw) : {};
      const settings = { ...DEFAULTS, ...saved };
      this.applyTheme(settings.darkMode);
      return settings;
    } catch {
      return DEFAULTS;
    }
  }
}
