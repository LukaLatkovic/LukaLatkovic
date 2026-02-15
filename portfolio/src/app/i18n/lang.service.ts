import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Lang, translations } from './translations';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly LS_KEY = 'pf_lang';
  lang: Lang = 'en';

  constructor(private router: Router, private route: ActivatedRoute) {}

  init() {
    const stored = (localStorage.getItem(this.LS_KEY) as Lang) || null;

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const qp = this.route.snapshot.queryParamMap.get('lang') as Lang | null;
      const next = qp ?? stored ?? 'en';
      this.setLang(next, false);
    });

    
    const qp = this.route.snapshot.queryParamMap.get('lang') as Lang | null;
    this.setLang(qp ?? stored ?? 'en', false);
  }

  t(key: string): string {
    return translations[this.lang][key] ?? translations.en[key] ?? key;
  }

  toggle() {
    const next: Lang = this.lang === 'en' ? 'sr' : 'en';
    this.setLang(next, true);
  }

  private setLang(lang: Lang, updateUrl: boolean) {
    this.lang = lang;
    localStorage.setItem(this.LS_KEY, lang);

    if (updateUrl) {
      const tree = this.router.createUrlTree([], {
        queryParams: { lang },
        queryParamsHandling: 'merge',
      });
      this.router.navigateByUrl(tree);
    }
  }
}
