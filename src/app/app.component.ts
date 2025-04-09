import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';

import { ThemeService, Theme } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentTheme$: Observable<Theme>;
  
  constructor(private themeService: ThemeService) {
    this.currentTheme$ = this.themeService.currentTheme$;
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
