import { Component } from '@angular/core';
import { LangService } from '../i18n/lang.service';

@Component({
  selector: 'section-hero',
  standalone: true,
  templateUrl: './hero.component.html'
  })
export class HeroSection {
  constructor(public i18n: LangService) {}
}