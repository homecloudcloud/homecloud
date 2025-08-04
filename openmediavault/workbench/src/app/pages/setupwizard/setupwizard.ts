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
import * as _ from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';

@Component({
  template: `<omv-logo-header></omv-logo-header>
             <div id="mainContainer">
                <div id="setupwizard-main-form1">
                  <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
             </div>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>
            `,        
  styleUrls: ['./setupwizard.scss'],
  encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
  selector:'omv-setupwizard-page',  //Home cloud changes
})
export class SetupWizardComponent extends BaseFormPageComponent {
  public safeHtmlContent:SafeHtml;
  private htmlContent=`<div class="container">
    <h1>Welcome to the Setup Wizard</h1>
    <p class="info">
      This will guide you through the essential steps to get your Homecloud up and running.
      If you choose to skip any step, you can always return to the <strong>Homecloud Workbench</strong> to complete it later.
    </p>

    <h2>Steps</h2>
    <div class="setupSteps">
      <p>Network Configuration</p>
      <p>VPN Setup</p>
      <p>Date & Time Configuration</p>
      <p>Notification Setup</p>
      <p>Apps Configuration:</p>
      <div class="app-list">
            <p>Cloud storage - Drive</p>
            <p>Photo management - Immich</p>
            <p>Document management - Paperless</p>
            <p>Notes - Joplin</p>
            <p>Password management - Vaultwarden</p>
            <p>Media server - Jellyfin</p>
      </div>
    </div>

    

  </div>`;
  
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {
        template:'submit',
        text:"Let's get started",
        execute: {
          type: 'url',
          url: '/setupwizard/networkconfig'
        }
      }
    ]

  };
  constructor(private sanitizer: DomSanitizer) {
     super();
     // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
         
     
      
    }
    
    ngAfterViewInit(): void {    
       
    }


  
}
