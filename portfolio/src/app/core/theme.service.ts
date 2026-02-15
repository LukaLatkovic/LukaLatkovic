import { Injectable } from '@angular/core';

type ThemeName = 'engineering' | 'creative';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly LS_DARK = 'pf_dark';
  private readonly LS_THEME = 'pf_theme';

  init() {
    const dark = localStorage.getItem(this.LS_DARK);
    const theme = (localStorage.getItem(this.LS_THEME) as ThemeName) || 'engineering';

    if (dark === '1') document.documentElement.classList.add('dark');
    document.documentElement.dataset['theme'] = theme === 'creative' ? 'creative' : '';
  }

  toggleDark() {
    const el = document.documentElement;
    const next = !el.classList.contains('dark');
    el.classList.toggle('dark', next);
    localStorage.setItem(this.LS_DARK, next ? '1' : '0');
  }

  togglePalette() {
    const el = document.documentElement;
    const current = (el.dataset['theme'] as ThemeName) || 'engineering';
    const next: ThemeName = current === 'creative' ? 'engineering' : 'creative';

    if (next === 'creative') el.dataset['theme'] = 'creative';
    else delete el.dataset['theme'];

    localStorage.setItem(this.LS_THEME, next);
  }
}
