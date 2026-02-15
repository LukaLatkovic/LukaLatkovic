import { Component } from '@angular/core';
import { LangService } from '../i18n/lang.service';

@Component({
  selector: 'section-contact',
  standalone: true,
  templateUrl: './contact.component.html'
  })
export class ContactSection {
  constructor(public i18n: LangService) {}
}