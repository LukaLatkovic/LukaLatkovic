import { Component } from '@angular/core';
import { LangService } from '../i18n/lang.service';

@Component({
  selector: 'section-skills',
  standalone: true,
  templateUrl: './skills.component.html'
  })
export class SkillsSection {
  constructor(public i18n: LangService) {}
}