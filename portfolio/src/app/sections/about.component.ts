import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'section-about',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './about.component.html',
})
export class AboutSection {}