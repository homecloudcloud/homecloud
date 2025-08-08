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
import { DomSanitizer } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';
import { SafeHtml } from '@angular/platform-browser';


@Component({
  selector:'omv-setupwizard-jellyfin-access-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
    <div id="jellyfin-access-form1">
      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
    </div>
  </div>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./jellyfin-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsJellyfinAccessComponent extends BaseFormPageComponent {
  private hostname: string = '';
    private jellyfinStatus: string = '';
    public safeHtmlContent: SafeHtml;
   
    private htmlContent = '';
    
  
    constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
      super();      
      
    }
    
    ngOnInit(){
      this.fetchStatusAndUpdateFields();  //get hostname value and update in link
    }
  
    fetchStatusAndUpdateFields(): void {
      this.rpcService.request('Homecloud', 'getJellyfinServiceStatus').subscribe(response => {
        this.jellyfinStatus = response.status;
        this.hostname = response.hostname; // Adjust based on API response structure
  
        this.htmlContent = `
          <div>
            <h1>Access Your App</h1>
            <div class="status-field ${this.jellyfinStatus !== 'Running' ? '' : 'hidden'}">
              <label>Jellyfin backend service status:</label>
              <span class="status-value ${this.jellyfinStatus !== 'Running' ? 'status-error' : 'status-success'}">${this.jellyfinStatus}</span>
            </div>
            <div class="status-message ${this.jellyfinStatus !== 'Running' ? '' : 'hidden'}">
              <span class="status-deploy-message ${this.jellyfinStatus !== 'Not deployed' ? 'hidden' : ''}" >App is not deployed. Go to <a class="plainLink" href="#/setupwizard/apps/media">Jellyfin main page</a> to deploy the app. </span>
              <span class="status-not-running-message ${this.jellyfinStatus !== 'Running' && this.jellyfinStatus !== 'Not deployed' ? '' : 'hidden'}" >App is not running currently. It may take a while for the app to start. Refresh the page to check status.</span>
            </div>
            <div class="access-info ${this.jellyfinStatus !== 'Running' ? 'hidden' : ''}">
              <p>
                You can access the  app from any device (phone, tablet, or computer) that's either:
                <ul>
                      <li>
                        Connected to the <strong>same VPN account</strong> as your Homecloud
                        <ul>
                          <li>Go to <a class="plainLink" href="#/setupwizard/vpn/status">VPN status page</a></li>
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
                  <strong>Used for initial setup and ongoing administrative tasks</strong> such as:
                  </p>
                  <ul>
                    <li>User creation</li>
                    <li>Library setup</li>
                  </ul>
                  <p>
                    <strong>Note:</strong> A user ID must be created via the <strong>WebApp</strong>.
                  </p> 
                <p>Simply click the button below: <br>
                <a class="app-btn ${this.jellyfinStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}" target="_blank">Access Jellyfin WebApp</a>
                </p>
  
              <h3>📱 Access via App</h3>
              <p>
                To use the Jellyfin app on your phone or tablet:
              </p>
              <ol>
                <li>Download the app:</li>
                <ul>
                    <li>Download the Jellyfin mobile app:</li>
                      <div class="mobile-app-links">
                        <a href="https://play.google.com/store/apps/details?id=org.jellyfin.mobile" target="_blank">
                          <img src="/assets/images/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height="50">
                        </a>
                      
                    
                        <a href="https://apps.apple.com/us/app/swiftfin/id1604098728" target="_blank">
                          <img src="/assets/images/download-on-the-app-store.svg" alt="Download on the App Store" height="50">
                        </a>
                      </div>
                    </li>
                    
                    <li>Download on computers including Windows, Mac and Linux:</li>
                    <p>
                        <a class="plainLink" href="https://github.com/jellyfin/jellyfin-media-player/releases" target="_blank">
                          Download on computers
                        </a>
                    </p>
                    
                    </li>
                    <li>Download on Smart TV:</li>
                    <p>
                        <a class="plainLink" href="https://jellyfin.org/downloads?type=TV" target="_blank">
                          Download on Smart TV
                        </a>
                    </p>
  
                    <li>Download the Finamp(For music) mobile app:</li>
                      <div class="mobile-app-links">
                        <a href="https://play.google.com/store/apps/details?id=com.unicornsonlsd.finamp" target="_blank">
                          <img src="/assets/images/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height="50">
                        </a>
                      
                    
                        <a href="https://apps.apple.com/us/app/finamp/id1574922594" target="_blank">
                          <img src="/assets/images/download-on-the-app-store.svg" alt="Download on the App Store" height="50">
                        </a>
                      </div>
                    </li>
                </ul><br>
                <li>Open the app after installation.</li>
                <li>When prompted, enter the following server URL:</li>
                <div class="hostURL">
                  <p><strong>${this.hostname}</strong>
                  <span onclick="navigator.clipboard.writeText('${this.hostname}')" 
                        title="Copy to clipboard" 
                        style="cursor: pointer; margin-left: 8px;">📋
                  </span>
                  </p>
                </div>
  
              </ol>
            
            <h3>📁 Accessing Your Media</h3>
                <p>
                  After logging into the <strong>Jellyfin WebApp</strong>, set up your media library:
                </p>
                <ol>
                  <li>Click the <strong>+</strong> button to create a new library.</li>
                  <li>Choose the <strong>content type</strong> (e.g., Music, Video, Mixed) and give it a display name.</li>
                  <li>Select a sub-folder from within the <code>/media</code> directory that matches your content type. This will appear in the folder dropdown.</li>
                  <li>Adjust any other settings as needed, then click <strong>OK</strong>.</li>
                </ol>
                <p>
                  To upload your media files, open the Drive share named <strong><code>jellyfin_media_share</code></strong> on your computer or phone and copy your files into the appropriate folders.
                  Go to Drive Access page to find instructions.
                </p>
                <p>
                  Jellyfin will automatically scan these files and display them in the app. If they don’t appear right away, you can trigger a manual scan from the Jellyfin WebApp.
        
                  </p>
          </div>        
        </div>
        `;
        
        // Sanitize the HTML content 
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
          
      });
  
    }
  public navConfig: FormPageConfig = {
  
    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Media app Setup',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/media'
        }
        
      },
      
      {template:'submit',
        text:'Next: Finish set up >',
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'appsMediaAccess',
            },
            successUrl:'/setupwizard/complete',
          }
        }
      }
      
    ]


  };
  
  
  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-jellyfin-access-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.enableNavButtons(); // Enable buttons after view initialization
    }, 100);  
  }


  
}
