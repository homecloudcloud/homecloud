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
import {FormPageConfig} from '~/app/core/components/intuition/models/form-page-config.type';


@Component({
  selector:'omv-setupwizard-drive-access-page', //Home cloud changes
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
    <div id="drive-access-form1">
      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
    </div>
  </div>
  <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,

  styleUrls: ['./drive-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsDriveAccessComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private sambaStatus: string = '';
 // private tailscaleStatus: string = '';
  public safeHtmlContent: SafeHtml; 
  private htmlContent = '';


  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();        
  }
  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();
    // Add toggle function to window for HTML access
    (window as any).toggleCollapse = (element: HTMLElement) => {
      const content = element.nextElementSibling as HTMLElement;
      const isHidden = content.style.display === 'none';
      if(isHidden){
        content.style.display='block';
        element.innerHTML = '▼ Click to View/Hide the video';

      }
      else{
        content.style.display='none';
        element.innerHTML = '▲ Click to View/Hide the video';
      }
     
    };
  }

  fetchStatusAndUpdateFields(): void {
    //get samba status
    this.rpcService.request('Services', 'getStatus').subscribe(response => {
      this.sambaStatus = response.data.find(s => s.name === 'samba')?.running ? 'Running' : 'Stopped';
      //get tailscale status
      this.rpcService.request('Homecloud', 'getHostname').subscribe(response => {
        this.hostname = response.hostname;
        //this.tailscaleStatus=response.status;

          this.htmlContent = `
            <div>
              <h1>Access Your Drive</h1>
              <div class="status-field ${this.sambaStatus !== 'Running' ? '' : 'hidden'}">
                <label>Drive backend service status:</label>
                <span class="status-value ${this.sambaStatus !== 'Running' ? 'status-error' : 'status-success'}">${this.sambaStatus}</span>
              </div>
              <div class="status-message ${this.sambaStatus !== 'Running' ? '' : 'hidden'}">   
                <span class="status-not-running-message">Drive backend service not running currently.Try restarting Homecloud. </span>
              </div>
              <div class="access-info ${this.sambaStatus !== 'Running' ? 'hidden' : ''}">
                <p>
                  You can access the drive from any device (phone, tablet, or computer) that's either:
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
         
                <h3>🌐 Access via Apple(iOS, iPadOS, macOS) Devices</h3>
                <p>
                  Simply click the button below: <br>
                  <a class="app-btn ${this.sambaStatus !== 'Running' ? 'disabled-btn' : ''}" href="smb://${this.hostname}/" target="_blank">Access Drive on Apple Devices</a>
                </p>
                <p>
                If the above link doesn't work, check out the detailed instructions below:
                </p>
                <p>You can also refer to the video instructions below.</p>
                    <div>
                      <div id="titleAp" onclick="toggleCollapse(this)" style="cursor: pointer;">▲ Click to view/hide Video</div>
                      <div id="contentAp" style="display: none;">
                        <video playsinline autoplay controls style="width:100%;height:100%;">
                          <source src="/assets/videos/fixed_iphone_compatible.webm" type="video/webm">
                          <source src="/assets/videos/Drive_apple_video.mp4" type="video/mp4">
                        </video>
                      </div>
                    </div>
                <br>

                <h3>📱 Access via Android Devices</h3>
                <p>
                  Access Drive using any app that supports network drives(SMB protocol). One such free app is File Manager Plus.
                </p>
                <ol>
                  <li>Download the File Manager Plus app:</li><br>
                      <a href="https://play.google.com/store/apps/details?id=com.alphainventor.filemanager" target="_blank">
                        <img src="/assets/images/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height="50">
                      </a>
                        
                  </li>
                  <li>Open the app after installation.</li>
                  <li>Click "Remote". </li>
                  <li>Click "Add Remote location". </li>
                  <li>Select "SMB". </li>
                  <li>When prompted, enter the following server URL:
                    <div class="hostURL">
                     <p> <strong>${this.hostname}</strong>
                      <span onclick="navigator.clipboard.writeText('${this.hostname}')" 
                            title="Copy to clipboard" 
                            style="cursor: pointer; margin-left: 8px;">📋
                      </span>
                    </p>

                    </div>
                  </li>
                  <li>Enter Drive userid and password and press "OK".</li>
                  <li>You can also refer to the video instructions below.</li>
                    <div>
                      <div id="titleAn" onclick="toggleCollapse(this)" style="cursor: pointer;">▲ Click to view/hide Video</div>
                      <div id="contentAn" style="display: none;">
                        <video playsinline controls style="width:100%;height:100%;"><source src="/assets/videos/DriveonAndroid.webm" type="video/webm"></video>
                      </div>
                    </div>
                  
                </ol>
                <br>


                <h3>🌐 Access via Windows Devices</h3>
                <p>
                  <strong>Windows Devices:</strong> Drive is mounted as <strong>Network Drive</strong> using File Explorer.
                </p>


                <ol>
                  <li>Open File Explorer >> Sidebar >> Network >> Press right button >> Map Network Drive</li>
                  <li>Enter two backward slashes(\\) followed by network name of Homecloud that can be copied from below >> Enable Reconnect at sign-in >> Connect using different credentials>> Browse >> Enter your Drive user credentials when prompted >> Select homes</li>
                  <li>Network name to access Homecloud:
                    <div class="hostURL">
                     <p><strong>${this.hostname}</strong>
                      <span onclick="navigator.clipboard.writeText('${this.hostname}')" 
                            title="Copy to clipboard" 
                            style="cursor: pointer; margin-left: 8px;">📋
                      </span>
                    </p>

                    </div>
                  </li>
                  <li>You can also refer to the video instructions below.</li>
                    <div>
                      <div id="titleW" onclick="toggleCollapse(this)" style="cursor: pointer;">▲ Click to view/hide Video</div>
                      <div id="contentW" style="display: none;">
                        <video playsinline controls style="width:100%;height:100%;"><source src="/assets/videos/Drive_Windows.webm" type="video/webm"></video>
                      </div>
                    </div>
                
                </ol>
                <br>


              </div>
          </div>
          `;
          
          // Sanitize the HTML content 
          this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
      });     
    });

  } 
  public navconfig: FormPageConfig = {
  
      fields:[
        
      ],
      buttons: [
        
        {template:'submit',
          text:'< Prev: Drive Users Setup',
          execute:
          {
            type:'url',
            url:'/setupwizard/apps/drive/users'
          }
          
        },
        
        {template:'submit',
          text:'Next: Photos App Setup >',
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
        },
        //Set this step as last complete step if skipped
        {template:'submit',
          text:'Skip this step',
          /*confirmationDialogConfig:{
            template: 'confirmation',
            title: '',
            message: 'If Users are not created, you will not be able to access Drive. Do you still want to skip?<b>Note:</b> You can also create users later from Homecloud Dashboard.'
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

    const buttons = document.querySelectorAll('omv-setupwizard-drive-access-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
  
}


 

