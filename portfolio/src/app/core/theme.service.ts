import { Injectable } from '@angular/core';

const LS_DARK = 'pf_dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = true;

  get isDark(): boolean {
    return this._dark;
  }

  init(): void {
    const stored = localStorage.getItem(LS_DARK);
    this._dark = stored !== '0';
    this.apply();
  }

  toggleDark(): void {
    this._dark = !this._dark;
    localStorage.setItem(LS_DARK, this._dark ? '1' : '0');
    this.apply();
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark', this._dark);
    document.documentElement.setAttribute(
      'data-theme',
      this._dark ? 'dark' : 'light'
    );
  }
}
