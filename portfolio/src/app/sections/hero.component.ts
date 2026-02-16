import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'section-hero',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './hero.component.html',
})
export class HeroSection {}