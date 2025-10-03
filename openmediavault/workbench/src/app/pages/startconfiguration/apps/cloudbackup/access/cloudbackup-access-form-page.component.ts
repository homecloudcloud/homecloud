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
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-cloudbackup-access-page', //Home cloud changes
  template: `
  <div id="cloudbackup-access-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <div id="cloudbackup-access-form2">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
  </div>
  `,
  styleUrls: ['./cloudbackup-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsCloudbackupAccessComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private duplicatiStatus: string = '';
  public safeHtmlContent: SafeHtml;
  public safeHtmlContent1: SafeHtml;
  
  private htmlContent = '';
//  private htmlContent1='';
  

  
 


  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();
             
  }
  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }

  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getDuplicatiServiceStatus').subscribe(response => {
      this.duplicatiStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure

      this.htmlContent = `
        <div>
          <h1>Access Your App</h1>
          <div class="status-field ${this.duplicatiStatus !== 'Running' ? '' : 'hidden'}">
            <label>Duplicati backend service status:</label>
            <span class="status-value ${this.duplicatiStatus !== 'Running' ? 'status-error' : 'status-success'}">${this.duplicatiStatus}</span>
          </div>
          <div class="status-message ${this.duplicatiStatus !== 'Running' ? '' : 'hidden'}">
            <span class="status-deploy-message ${this.duplicatiStatus !== 'Not deployed' ? 'hidden' : ''}" >App is not deployed. Go to <a class="plainLink" href="#/startconfiguration/apps/cloudbackup">cloudbackup main page</a> to deploy the app. </span>
            <span class="status-not-running-message ${this.duplicatiStatus !== 'Running' && this.duplicatiStatus !== 'Not deployed' ? '' : 'hidden'}" >App is not running currently. Go to <a class="plainLink" href="#/startconfiguration/apps/cloudbackup/restart">cloudbackup status page</a> to check the status or restart the app. </span>
          </div>
          <div class="access-info ${this.duplicatiStatus !== 'Running' ? 'hidden' : ''}">

            <h3>🌐 Access via Web</h3>
            <p>
              <p>
                <strong>Used for configuring cloud backup</strong> to Google Drive, OneDrive and more:
                </p>
                <p>
                  <strong>Note:</strong> Initial Duplicati password is "Duplicati@homecloud". Once you change Homecloud Workbench admin password it will become same as that. To change go to user settings located at top right corner of this page.
                </p> 
              Simply click the button below: <br>
              <a class="app-btn ${this.duplicatiStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}" target="_blank">Access Duplicati</a>
            </p>
          </div>
      </div>
      `;
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);

      
    });

  }
 
 
  
}

 