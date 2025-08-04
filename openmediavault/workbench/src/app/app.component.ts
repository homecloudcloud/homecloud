/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2024 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
import { Component, Inject, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

import {
  PrefersColorScheme,
  PrefersColorSchemeService
} from '~/app/shared/services/prefers-color-scheme.service';

@Component({
  selector: 'omv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(@Inject(DOCUMENT) private document: Document,
    private prefersColorSchemeService: PrefersColorSchemeService,
    private renderer2: Renderer2,
    private router: Router //Homecloud changes
  ) {
    this.prefersColorSchemeService.change$.subscribe(
      (prefersColorScheme: PrefersColorScheme): void => {
        if (prefersColorScheme === 'dark') {
          this.renderer2.addClass(document.body, 'omv-dark-theme');
        } else {
          this.renderer2.removeClass(document.body, 'omv-dark-theme');
        }
      }
    );
  }

  //Homecloud changes start
  ngOnInit() {
    console.log('AppComponent initialized');
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Slight delay to allow DOM updates
      setTimeout(() => this.checkAndUpdateBackgroundColor(), 0);
    });
    
    
    //this.checkAndUpdateBackgroundColor();
    
  }
  ngAfterViewInit() {
    console.log('Afterview Init called');
    // Initial call to set the background color when the component loads
    setTimeout(() => {
      this.checkAndUpdateBackgroundColor();
    },0);   
  }
  // Function to check for dark mode (omv-dark-mode) and mainContainer, then update the background color
  checkAndUpdateBackgroundColor() {
    const isDarkMode = this.document.body.classList.contains('omv-dark-mode');
    const mainContainer = this.document.getElementById('mainContainer');
    //console.log('isDarkMode:', isDarkMode);
    //console.log('mainContainer:', mainContainer);

    if (!isDarkMode){
      if (mainContainer) {
      this.document.documentElement.style.setProperty('--mat-background-color-body', '#FFFFFF');
      }
      else{
        this.document.documentElement.style.setProperty('--mat-background-color-body', '#5dacdf');
      }
    } 
  }
  //Homecloud changes end
}
