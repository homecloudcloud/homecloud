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
  selector:'omv-joplin-access-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <div id="joplin-access-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>`,
  styleUrls: ['./joplin-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsJoplinAccessComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private joplinStatus: string = '';
  public safeHtmlContent: SafeHtml;
 
  private htmlContent = '';
  

  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();      
    
  }
  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }

  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getJoplinServiceStatus').subscribe(response => {
      this.joplinStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure

      this.htmlContent = `
        <div>
          <h1>Access Your App</h1>
          <div class="status-field ${this.joplinStatus !== 'Running' ? '' : 'hidden'}">
            <label>Joplin backend service status:</label>
            <span class="status-value ${this.joplinStatus !== 'Running' ? 'status-error' : 'status-success'}">${this.joplinStatus}</span>
          </div>
          <div class="status-message ${this.joplinStatus !== 'Running' ? '' : 'hidden'}">
            <span class="status-deploy-message ${this.joplinStatus !== 'Not deployed' ? 'hidden' : ''}" >App is not deployed. Go to <a class="plainLink" href="#/startconfiguration/apps/notes">Joplin main page</a> to deploy the app. </span>
            <span class="status-not-running-message ${this.joplinStatus !== 'Running' && this.joplinStatus !== 'Not deployed' ? '' : 'hidden'}" >App is not running currently. Go to <a class="plainLink" href="#/startconfiguration/apps/notes/restart">Joplin status page</a> to check the status or restart the app. </span>
          </div>
          <div class="access-info ${this.joplinStatus !== 'Running' ? 'hidden' : ''}">
            <p>
              You can access the  app from any device (phone, tablet, or computer) that's either:
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
                    <li>On the <strong>same local network</strong>(If VPN not configured or status is <strong>"Down"</strong>) as your Homecloud device</li>
              </ul>
            </p>

            <h3>🌐 Access via Web</h3>
            <p>
                <p>
                  <strong>Used for initial setup and ongoing administrative tasks</strong> such as user creation.
                </p>
                <p class="init-login-info">
                  <strong>Initial login ID:</strong> <code>admin@localhost</code><br>
                  <strong>Password:</strong> <code>admin</code>
                </p>
                <p>
                  <strong>Important:</strong> Change the default password after your first login.
                  <h3>🔐 To be able to recover your password later, please complete the following steps:</h3>
                  <ol>
                    <li>
                      <strong>Update your email address</strong> in your profile using the <strong>Joplin Web App</strong>.
                      <br>
                      Go to your profile settings and ensure your current email is saved. Post confirmation, your email will become your login id.
                    </li>
                    <li>
                      <strong>Configure your email notifications</strong> from the 
                      <a class="plainLink" href="#/startconfiguration/notificationsettings"><strong>Notification Settings</strong></a> page.
                      <br>
                    </li>
                  </ol>
                </p>


              Simply click the button below: <br>
              <a class="app-btn ${this.joplinStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}" target="_blank">Access Joplin WebApp</a>
            </p>

            <h3>📱 Access via App</h3>
            <p>
              To use the Joplin app on your phone or tablet:
            </p>
            <ol>
              <li>Download the app:</li>
              <ul>
                  <li>Download the Joplin mobile app:</li>
                    <div class="mobile-app-links">
                      <a href="https://play.google.com/store/apps/details?id=net.cozic.joplin" target="_blank">
                        <img src="/assets/images/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height="50">
                      </a>
                    
                  
                      <a href="https://apps.apple.com/us/app/joplin/id1315599797" target="_blank">
                        <img src="/assets/images/download-on-the-app-store.svg" alt="Download on the App Store" height="50">
                      </a>
                    </div>
                  </li>
                  <li>Download on computers including Windows, Mac and Linux:</li>
                      <a class="plainLink" href="https://joplinapp.org/help/install/" target="_blank">
                        Download on computers
                      </a>
                  
                  </li>
              </ul><br>
              <li>Open the app after installation.</li>
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

      
