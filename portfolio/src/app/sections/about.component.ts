import { Component } from '@angular/core';
import { LangService } from '../i18n/lang.service';

@Component({
  selector: 'section-about',
  standalone: true,
  templateUrl: './about.component.html'
  })
export class AboutSection {
  constructor(public i18n: LangService) {}
}