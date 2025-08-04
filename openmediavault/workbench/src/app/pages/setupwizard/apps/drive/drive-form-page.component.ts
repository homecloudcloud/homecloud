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
import { Component } from '@angular/core';
//import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';




@Component({
  selector:'omv-setupwizard-drive-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `<omv-logo-header></omv-logo-header>
              <div id="mainContainer">
                      <div id="drive-main-form1">
                          <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
                        </div>
              </div>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,
  styleUrls: ['./drive-form-page.component.scss'],

  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsDriveMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
    private htmlContent = `
    <div class="content-wrapper">
    <div class="left-column">
      <p class="intro-text">
        Drive provides network storage that you can easily access through your local network or a VPN. It's ideal for storing files that are frequently updated, like Excel spreadsheets, Word documents, and more. Drive also supports laptop backups and fully integrates with Apple Time Machine.
      </p>
      <h2>Key Features:</h2>
      <ul>
        <li><strong>USB Disk Integration</strong><br>
          When you connect USB drives to Homecloud, they are automatically accessible as network shares. You can manage their access permissions directly from the Shares page on Homecloud workbench under <strong>"Configure >> Apps > Drive >> Shares"</strong>.
        </li>
  
        <li><strong>Backups</strong><br>
          For backing up your data from computers, you can use software like Duplicati or Apple Time Machine. To know more about Duplicati, visit the <a class="plainLink" target="_blank" href="https://www.duplicati.com/">Duplicati Official website</a>.
        </li>
      </ul>
  
      <h2>Getting Started</h2>
      <p>To get started, go to the <a class="plainLink" href="#/setupwizard/apps/drive/users">users page</a></p> 
    </div>
  
    <div class="right-column">
      <img src="/assets/images/Drive.png" alt="Drive image">
    </div>
  </div>
  
      
  `;
    
     constructor(private sanitizer: DomSanitizer) {
        super();
         // Sanitize the HTML content once during construction
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    
      }
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Apps- Main Page',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps'
        }
        
      },
      
      {template:'submit',
        text:'Next: Drive Users Setup >',
        execute: {
            type: 'request',        
            request:{
              service: 'Flags',
              task:false,
              method: 'saveLastCompletedStep',
              params:{
                'lastCompletedStepName':'appsDrive'
              },
              successUrl:'/setupwizard/apps/drive/users',
            }
          }
      },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip Drive Setup',
        /*confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'If VPN is not configured, You will not be able to access Homecloud from outside your local network. Some applications like Password manager will also not work without VPN. Do you still want to skip?<b>Note:</b> You can also configure VPN later from Homecloud Dashboard.'
        },
        */
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'appsDriveAccess'
            },
            successUrl:'/setupwizard/apps/photos',
          }
        }
      }
    
    ]
  };
  ngAfterViewInit() {
    setTimeout(() => {
      this.enableNavButtons();
      
      document.querySelector('meta[name="viewport"]').setAttribute("content", "width=device-width, initial-scale=1.0, user-scalable=yes");
      
    }, 100);
  }

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-drive-main-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
  
}
