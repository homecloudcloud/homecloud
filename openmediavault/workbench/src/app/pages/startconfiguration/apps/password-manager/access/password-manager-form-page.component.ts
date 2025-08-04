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
import * as _ from 'lodash';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-password-manager-access-page', //Home cloud changes
  template: `
  <div id="password-manager-access-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>`,
  styleUrls: ['./password-manager-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsPasswordManagerConfigComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private vaultWardenStatus: string = '';
  public safeHtmlContent: SafeHtml;
 
  private htmlContent = '';
  

  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();      
    
  }
  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }

  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getVaultwardenServiceStatus').subscribe(response => {
      this.vaultWardenStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure

      this.htmlContent = `
        <div>
          <h1>Access Your App</h1>
          <div class="status-field ${this.vaultWardenStatus !== 'Running' ? '' : 'hidden'}">
            <label>Password manager backend service status:</label>
            <span class="status-value ${this.vaultWardenStatus !== 'Running' ? 'status-error' : 'status-success'}">${this.vaultWardenStatus}</span>
          </div>
          <div class="status-message ${this.vaultWardenStatus !== 'Running' ? '' : 'hidden'}">
            <span class="status-deploy-message ${this.vaultWardenStatus !== 'Not deployed' ? 'hidden' : ''}" >App is not deployed. Go to <a class="plainLink" href="#/startconfiguration/apps/password-manager">Password manager main page</a> to deploy the app. </span>
            <span class="status-not-running-message ${this.vaultWardenStatus !== 'Running' && this.vaultWardenStatus !== 'Not deployed' ? '' : 'hidden'}" >App is not running currently. Go to <a class="plainLink" href="#/startconfiguration/apps/password-manager/restart">Password manager status page</a> to check the status or restart the app. </span>
          </div>
          <div class="access-info ${this.vaultWardenStatus !== 'Running' ? 'hidden' : ''}">
            <p>
              You can access the  app from any device (phone, tablet, or computer) that's:
              <ul>
                    <li>
                      Connected to the <strong>same VPN account</strong> as your Homecloud
                      <ul>
                        <li>Go to <a class="plainLink" href="#/startconfiguration/vpn/status">VPN status page</a></li>
                        <li>Verify that VPN is configured and status is <strong>"Up"</strong> on your Homecloud server.</li>
                        <li>Verify that your access device(phone/laptop) is in the device list on this page.</li>
                        <li>If present, your access device is connected to VPN.</li>
                        <p> Note: If VPN is configured and status is <strong>"Up"</strong> on Homecloud server, all access devices should also be connected to VPN.
                      </ul>
                    </li>
                    
              </ul>
            </p>

            <h3>🌐 Access via Web</h3>
            <p>
                <strong>Used for initial setup and ongoing administrative tasks</strong> such as:
                </p>
                <ul>
                  <li>User creation</li>
                  <li>Password export</li>
                </ul>
                <p>
                  <strong>Note:</strong> A user ID must be created via the <strong>WebApp</strong>.
                </p> 


              Simply click the button below: <br>
              <a class="app-btn ${this.vaultWardenStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}" target="_blank">Access Password manager WebApp</a>
            </p>

            <h3>📱 Access via App</h3>
            <p>
              To use the Password manager app on your phone or tablet:
            </p>
            <ol>
              <li>Download the app:</li>
              <ul>
                  <li>Download the Vaultwarden mobile app:</li>
                    <div class="mobile-app-links">
                      <a href="https://play.google.com/store/apps/details?id=com.x8bit.bitwarden" target="_blank">
                        <img src="/assets/images/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height="50">
                      </a>
                    
                  
                      <a href="https://apps.apple.com/us/app/bitwarden-password-manager/id1137397744" target="_blank">
                        <img src="/assets/images/download-on-the-app-store.svg" alt="Download on the App Store" height="50">
                      </a>
                    </div>
                  </li>
                  <li>Browser extensions: Recommended for Windows, MacOS and Linux computers</li>
                      <a class="plainLink" href="https://bitwarden.com/download/" target="_blank">
                        Download Browser extensions
                      </a>
                  
                  </li>
              </ul><br>
              <li>Open the app after installation.</li>
              <li>Select "Self-hosted" in the drop-down.</li>
              <li>When prompted, enter the following server URL:</li>
              <div class="hostURL">
                <strong>${this.hostname}</strong>
                <span onclick="navigator.clipboard.writeText('${this.hostname}')" 
                      title="Copy to clipboard" 
                      style="cursor: pointer; margin-left: 8px;">📋
                </span>

              </div>

            </ol>
          </div>
      </div>
      `;
      
      // Sanitize the HTML content 
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
        
    });

  }
 
 
  
}

