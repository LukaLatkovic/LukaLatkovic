import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'section-skills',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './skills.component.html',
})
export class SkillsSection {}