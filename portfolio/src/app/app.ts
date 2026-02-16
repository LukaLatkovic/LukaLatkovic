import { Component, OnInit, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/theme.service';
import { AboutSection } from './sections/about.component';
import { ContactSection } from './sections/contact.component';
import { ExperienceSection } from './sections/experience.component';
import { HeroSection } from './sections/hero.component';
import { SkillsSection } from './sections/skills.component';
import { ThreeBgComponent } from './shared/three-bg.component';
import { TechMapSection } from './sections/tech-map.component';
import { TranslateModule } from '@ngx-translate/core';

type Lang = 'en' | 'sr';
const LS_LANG = 'pf_lang';

@Component({
  selector: 'app-root',
  imports: [
    UpperCasePipe,
    TranslateModule,
    HeroSection,
    ExperienceSection,
    SkillsSection,
    AboutSection,
    ContactSection,
    ThreeBgComponent,
    TechMapSection,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('Luka Latković - Portfolio');
  date = new Date().getFullYear();

  constructor(
    public theme: ThemeService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.theme.init();
    const stored = localStorage.getItem(LS_LANG) as Lang | null;
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const qp = this.route.snapshot.queryParamMap.get('lang') as Lang | null;
        const storedNow = localStorage.getItem(LS_LANG) as Lang | null;
        const lang = qp ?? storedNow ?? 'en';
        this.translate.use(lang);
        localStorage.setItem(LS_LANG, lang);
      });
    const qp = this.route.snapshot.queryParamMap.get('lang') as Lang | null;
    const lang = qp ?? stored ?? 'en';
    this.translate.use(lang);
    localStorage.setItem(LS_LANG, lang);
  }

  get currentLang(): string {
    return this.translate.currentLang ?? 'en';
  }

  toggleLang(): void {
    const next: Lang = this.currentLang === 'en' ? 'sr' : 'en';
    this.translate.use(next);
    localStorage.setItem(LS_LANG, next);
    this.router.navigate([], {
      queryParams: { lang: next },
      queryParamsHandling: 'merge',
    });
  }
}
