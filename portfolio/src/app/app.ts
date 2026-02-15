import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';
import { AboutSection } from './sections/about.component';
import { ContactSection } from './sections/contact.component';
import { ExperienceSection } from './sections/experience.component';
import { HeroSection } from './sections/hero.component';
import { SkillsSection } from './sections/skills.component';

@Component({
  selector: 'app-root',
  imports: [HeroSection, ExperienceSection, SkillsSection, AboutSection, ContactSection],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Luka Latković - Portfolio');
  constructor(public theme: ThemeService) {}
  ngOnInit() { this.theme.init(); }

  date = new Date().getFullYear();
}
