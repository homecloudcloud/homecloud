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
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';


@Component({
  selector:'apps-setupwizard-main-page', //Home cloud changes
  template: `<omv-logo-header></omv-logo-header>
  <div id="mainContainer">
    <div id="apps-main-form1">
      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
    </div>
  </div>
  <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,
  styleUrls: ['./apps-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsMainComponent extends BaseFormPageComponent implements AfterViewInit {
  
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `<h1>Open-Source App Support</h1>
                          <p>
                            Homecloud lets you run selected open-source apps that work behind the scenes to store and manage your data.
                            You can access these apps from your phone, laptop, or web browser.
                          </p>
                          <p>
                            These apps are created and maintained by open-source communities and are freely available on public repositories.
                          </p>
                          <p>
                            Homecloud by Libernest Technologies Pvt. Ltd. is not affiliated with or endorsed by any of the open-source projects referenced on this site. These projects are included solely for the convenience of users, and all trademarks, project names, and logos are the property of their respective owners.

                          </p>
                          <h2>To deploy/access these apps, follow next steps.</h2>
                          `;

  
  
  constructor(private sanitizer: DomSanitizer) {
    super();
    // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }h

  ngAfterViewInit(): void {
    // No need for manual DOM manipulation anymore
  }

  public navconfig: FormPageConfig = {
  
      fields:[
        
      ],
      buttons: [
        
        {template:'submit',
          text:'< Prev: Notification Settings',
          execute:
          {
            type:'url',
            url:'/setupwizard/notificationsettings'
          }
          
        },
        
        {template:'submit',
          text:'Next: Apps- Drive set up >',
          execute: {
              type: 'request',        
              request:{
                service: 'Flags',
                task:false,
                method: 'saveLastCompletedStep',
                params:{
                  'lastCompletedStepName':'appsMain'
                },
                successUrl:'/setupwizard/apps/drive',
              }
            }
        }
      
      ]
    };
}
