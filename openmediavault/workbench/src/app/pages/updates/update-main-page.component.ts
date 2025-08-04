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
import { Component, ViewEncapsulation } from '@angular/core';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';

@Component({
  selector:'omv-update-main-page',
  template: `
  <div id="update-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls:['./update-main-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class UpdateMainPageComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  private htmlContent=`
    <h1>🔄 Manage Homecloud Updates</h1>
    <p>
    Stay up to date with the latest <strong>Homecloud software updates</strong> 🛠️ for improved performance, features, and security.
    </p>

    <div class="note">
    🔔 <strong>Note:</strong> This section manages updates for the <strong>Homecloud system only</strong>.App updates (e.g., Immich, Vaultwarden) are handled individually through their own app pages 📦.
    </div>`;


    constructor(private sanitizer:DomSanitizer){
        super();
        // Sanitize the HTML content once during construction
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    }
}
