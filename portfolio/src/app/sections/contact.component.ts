import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'section-contact',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact.component.html',
})
export class ContactSection {}