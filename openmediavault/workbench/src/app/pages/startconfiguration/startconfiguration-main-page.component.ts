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
import { Component, AfterViewInit } from '@angular/core';
//import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector:'startconfiguration-main-page', //Home cloud changes
  template: `
  <div id="startconfiguration-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./startconfiguration-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class startconfigurationMainComponent extends BaseFormPageComponent implements AfterViewInit {
  
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `<div class="container">
                          <h1>⚙️ Homecloud Configuration</h1>
                          <p class="intro">Manage Homecloud settings, apps, VPN, USB disks, and notifications - all from one place! 🚀</p>
                        </div>
                          `;

  
  
  constructor(private sanitizer: DomSanitizer) {
    super();
    // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }h

  ngAfterViewInit(): void {
    // No need for manual DOM manipulation anymore
  }
}
