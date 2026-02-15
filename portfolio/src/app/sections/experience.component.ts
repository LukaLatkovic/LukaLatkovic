import { Component } from '@angular/core';
import { LangService } from '../i18n/lang.service';

@Component({
  selector: 'section-experience',
  standalone: true,
  templateUrl: './experience.component.html'
  })
export class ExperienceSection {
  constructor(public i18n: LangService) {}
}