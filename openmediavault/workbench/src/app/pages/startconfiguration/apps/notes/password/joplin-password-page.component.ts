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
//import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';




@Component({
  selector:'omv-joplin-password-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
          <div id="joplin-password-form1">
            <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
          </div>`,
  styleUrls: ['./joplin-password-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsJoplinPasswordResetComponent extends BaseFormPageComponent {
  
  public safeHtmlContent: SafeHtml;
  public users: any[] = [];
  public serviceRunning: boolean = false;
  public hostname: string = '';
  private joplinStatus: string = '';
  public isLoading: boolean = false;

  constructor(private sanitizer: DomSanitizer,private rpcService:RpcService) {
      super();
      
       
  }

  ngOnInit() {
    this.checkServiceStatus();
    
    // Add event listener for the custom event
    document.addEventListener('getUsers', () => {
      this.getUsers();
    });
  }
  
  ngOnDestroy() {
    // Remove event listener when component is destroyed
    document.removeEventListener('getUsers', () => {
      this.getUsers();
    });
  }
  
 

  updateHtmlContent():void{

     // Generate users table HTML if users exist
    let usersTableHtml = '';
    if (this.users.length > 0) {
      let tableRows = '';
      this.users.forEach(user => {
        tableRows += `
          <tr>
            <td>${user.email}</td>
          </tr>
        `;
      });
      
      usersTableHtml = `
        <div class="users-table-container">
          <h2>Joplin Users</h2>
          <table class="users-table">
            <thead>
              <tr>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;
    }

    const htmlContent=`<div class="container">
                        <h1>📬 Forgot Your Joplin Password?</h1>
                        <p>
                        Don’t worry — resetting your password is easy!
                        Just head over to the 👉 <a href="${this.hostname}" target="_blank" class="app-btn ${this.joplinStatus !== 'Running' ? 'disabled-btn' : ''}"><strong>Joplin Web App</strong></a>
                        and click <strong>Forgot Password</strong>.
                        You’ll receive an email with a password reset link 📧.
                        <br><span class="status-error ${this.joplinStatus !== 'Running' ? '' : 'hidden'}" >Joplin is not running! Go to <a href="#/startconfiguration/apps/notes/restart" class="plainLink"><strong>Joplin status page</strong></a> to check the status or restart the app</span>   
                        </p>

                        <div class="important">
                          ⚠️ <strong>Important:</strong> Before using the reset feature, please check the following:
                          <ul>
                            <li>
                              🛠️ <strong>Email sending</strong> is correctly configured under the
                              👉 <a class="plainLink" href="#/startconfiguration/notificationsettings"><strong>Notifications</strong></a> page.
                              Use the <strong>Test</strong> button to confirm you're receiving emails from Homecloud.
                            </li>
                            <li>
                              👤 Your <strong>email address is correct</strong> in your Joplin user profile.
                              This can be updated via the Joplin Web App, but must be set <strong>before</strong> using password reset.
                            </li>
                          </ul>
                        </div>
                        <div class="button-container">
                          <button  
                                  class="mat-flat-button ${!this.serviceRunning || this.isLoading ? 'mat-button-disabled' : 'omv-background-color-pair-primary'}" 
                                  onclick="document.dispatchEvent(new CustomEvent('getUsers'))" 
                                  ${!this.serviceRunning || this.isLoading ? 'disabled' : ''}>
                            ${this.isLoading ? '<span class="loading-spinner"></span>' : 'Get Joplin Users'}
                          </button>
                          ${!this.serviceRunning ? '<div class="service-status-message">Joplin service is not running</div>' : ''}
                        </div>
                        ${usersTableHtml}
                      </div>
                    </div> `;

      
         // Sanitize the HTML content 
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
       

  }
  checkServiceStatus() {
    this.rpcService.request('Homecloud', 'getJoplinServiceStatus').subscribe(
      (response) => {
        if (response){
         // console.log('service status:',response.status);
         // console.log('service url:',response.hostname);
          this.hostname = response.hostname;
          this.joplinStatus = response.status; // Store the status for later use
          if( response.status === 'Running') {
            this.serviceRunning = true;
          }
          
        }  
        this.updateHtmlContent();
        
      },
      (error) => {
        console.error('Error checking service status:', error);
        this.serviceRunning = false;
        this.updateHtmlContent(); // Still update HTML even if there's an error
      }
    );
  }
  
  getUsers() {
    this.isLoading = true;
    this.updateHtmlContent(); // Update HTML content after users are loaded
    this.rpcService.request('Homecloud', 'joplin_getusers').subscribe(
      (response) => {
        this.isLoading = false;
        if (Array.isArray(response)) {
          this.users = response;
          this.updateHtmlContent(); // Update HTML content after users are loaded
        } else if (response.error) {
          // Handle error
          console.error('Error fetching users:', response.error);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('RPC error:', error);
      }
    );
  }
}
