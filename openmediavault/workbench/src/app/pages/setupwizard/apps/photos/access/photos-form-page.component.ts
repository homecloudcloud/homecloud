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
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';




@Component({
  selector:'omv-setupwizard-photos-access-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
    <div id="photos-access-form1">
      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
    </div>
    <!--removing funnel activation from wizard-->
    <!--div id="photos-access-form2">
      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
    </div>

    <omv-intuition-form-page id="photos-access-form3" [config]="this.config2"></omv-intuition-form-page-->
  </div>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-config-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosConfigComponent extends BaseFormPageComponent {
   private hostname: string = '';
  private photosStatus: string = '';
  public safeHtmlContent: SafeHtml;
  public safeHtmlContent1: SafeHtml;
  
  private htmlContent = '';
  private htmlContent1='';
  

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        params:{
          appname: 'immich'
        },
        method: 'getFunnelStatus'
      }   
    },
    fields: [  

      {
        type: 'textInput',
        name: 'status',
        label: gettext('Internet sharing status'),
        hint: gettext('If enabled, then Immich is accessible from public internet without VPN. Only enable if you understand the risks.'),
        value: '',
        readonly: true
      },
      {
        type: 'textInput',
        name: 'url',
        label: gettext('Internet access link for Non-VPN users'),
        hint: gettext('This is the link to access Immich over internet without VPN. Only visible if status is Enabled.'),
        hasCopyToClipboardButton:true,
        value: '',
        readonly: true
      }
    ],
    buttons: [
      {
        text: 'Enable sharing Immich Photo app on public Internet for non-VPN users)',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'CAUTION! This may increase risk of unauthorized access as Homecloud will become accessible from Internet without VPN. Do you really want to continue? '
        },
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Message'),
              autoScroll: true,
              startOnInit: true,
              buttons: {
                start: {
                  hidden: true
                },
                stop: {
                  hidden: true
                },
                close:{
                  hidden: false,
                  disabled: false,
                  autofocus: false,
                  dialogResult: true
                }

              },
              request: {
                service: 'Homecloud',
                method: 'createTailscaleFunnel',
                params:{
                  source_port: 10000,
                  destination_port: 2284
                }
              }
            },
          successUrl:'/setupwizard/apps/photos'
          }
        }
      },
      {
        text: 'Disable Internet sharing',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Message'),
              autoScroll: true,
              startOnInit: true,
              buttons: {
                start: {
                  hidden: true
                },
                stop: {
                  hidden: true
                },
                close:{
                  hidden: false,
                  disabled: false,
                  autofocus: false,
                  dialogResult: true
                }
              },
              request: {
                service: 'Homecloud',
                method: 'disableTailscaleFunnel',
                params:{
                  source_port: 10000,
                  destination_port: 2284
                }
              }
            },
          successUrl:'/setupwizard/apps/photos'
          }
        }
      },
    ]
  };
 


  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();
             
  }
  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }

  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getImmichServiceStatus').subscribe(response => {
      this.photosStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure

      this.htmlContent = `
        <div>
          <h1>Access Your App</h1>
          <div class="status-field ${this.photosStatus !== 'Running' ? '' : 'hidden'}">
            <label>Immich backend service status:</label>
            <span class="status-value ${this.photosStatus !== 'Running' ? 'status-error' : 'status-success'}">${this.photosStatus}</span>
          </div>
          <div class="status-message ${this.photosStatus !== 'Running' ? '' : 'hidden'}">
            <span class="status-deploy-message ${this.photosStatus !== 'Not deployed' ? 'hidden' : ''}" >App is not deployed. Go to <a class="plainLink" href="#/setupwizard/apps/photos">photos main page</a> to deploy the app. </span>
            <span class="status-not-running-message ${this.photosStatus !== 'Running' && this.photosStatus !== 'Not deployed' ? '' : 'hidden'}" >App is not running currently. It may take a while for the app to start. Refresh the page to check status.</span>
          </div>
          <div class="access-info ${this.photosStatus !== 'Running' ? 'hidden' : ''}">
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
                  <li>Assigning quotas</li>
                  <li>Face merging</li>
                  <li>Indexing pictures on connected external USB drives</li>
                </ul>
                <p>
                  <strong>Note:</strong> A user ID must be created via the <strong>WebApp</strong>.
                </p> 
              <p>Simply click the button below:<br>
                <a class="app-btn ${this.photosStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}" target="_blank">Access photos WebApp</a>
              </p>

            <h3>📱 Access via Mobile App</h3>
            <p>
              To use the Immich app on your phone or tablet:
            </p>
            <ol>
              <li>Download the Immich mobile app:</li>
                <div class="mobile-app-links">
                  <a href="https://play.google.com/store/apps/details?id=app.alextran.immich" target="_blank">
                    <img src="/assets/images/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" height="50">
                  </a>
                
              
                  <a href="https://apps.apple.com/sg/app/immich/id1613945652" target="_blank">
                    <img src="/assets/images/download-on-the-app-store.svg" alt="Download on the App Store" height="50">
                  </a>
                </div>
              </li>
              <li>Open the app after installation.</li>
              <li>When prompted, enter the following server URL:</li>
              <div class="hostURL">
                <p><strong>${this.hostname}</strong>
                <span onclick="navigator.clipboard.writeText('${this.hostname}')" style="cursor: pointer; margin-left: 8px;">📋</span>
                </p>
              </div>

            </ol>
          </div>
      </div>
      `;
      this.htmlContent1=`
                    <div class="sharing-info ${this.photosStatus !== 'Running' ? 'hidden' : ''}">
                      <h2>🔗 Share Photos or Videos Outside Your VPN</h2>
                       <p>
                          You can <strong>share your photos or videos</strong> with users who are not connected to your 
                          <strong> Tailscale VPN</strong>. This is made possible using the <strong>Tailscale Funnel</strong> service.
                       </p>
                       <p>
                          🌐 This allows the <strong>Immich</strong> application to be securely accessed from the Internet
                          <strong> without requiring VPN connectivity</strong>.
                       </p>
                       <h3>⚠️ Use With Caution</h3>
                       <p>
                        Enabling public access introduces <strong>potential security risks</strong>. It is recommended to:
                       </p>
                       <ul>
                        <li>🔒 Use <strong>strong, unique passwords</strong> before enabling public access.</li>
                        <li>👤➕ Create a dedicated user via the <strong>administration page</strong>(Webapp) and share credentials securely.</li>
                        <li>📤 To share a specific photo or video, use the <strong>Share</strong> button within the interface.</li>
                        <li>⏳ <strong>Limit the time</strong> that public access remains enabled.</li>
                       </ul>
                    </div>

 
 
 
  `;
      // Sanitize the HTML content 
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
      this.safeHtmlContent1 = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent1);


   
    //Hide Internet sharing section if Immich is not running
    const internetShareSection=document.querySelector('#photos-access-form3');
    if(internetShareSection){
        if(this.photosStatus !== 'Running'){    
        
            internetShareSection.classList.add('hidden');
          
        }
        else{
          
            internetShareSection.classList.remove('hidden');
          
        }
    }
    
      
    });

      // Fetch Internet sharing status
    this.rpcService.request('Homecloud', 'getFunnelStatus', { appname: 'immich' }).subscribe(funnelResponse => {
      const internetSharingStatus = funnelResponse.status;
      
      // Update button configuration based on Internet sharing status
      if (internetSharingStatus === 'Enabled') {
        // Show only disable button
        this.config2.buttons = [this.config2.buttons[1]]; // Keep only disable button
      } else {
        // Show only enable button
        this.config2.buttons = [this.config2.buttons[0]]; // Keep only enable button
      }
      
      
    });
  }
 
  public navConfig: FormPageConfig = {
  
      fields:[
        
      ],
      buttons: [
        
       {template:'submit',
        text:'< Prev: Photos App Setup',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/photos'
        }
        
      },
      
      {template:'submit',
        text:'Next: Documents app Setup >',
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'appsPhotosAccess'
            },
            successUrl:'/setupwizard/apps/paperless',
          }
        }

      }
      ]
  
  
    };
    ngAfterViewInit(): void {    
         
      // Delay the operation to ensure the view is fully rendered
      setTimeout(() => {
  
        this.enableNavButtons();
  
       
       
      
      }, 100); // Timeout ensures it happens after the view has rendered
    }
    
    enableNavButtons() {
  
      const buttons = document.querySelectorAll('omv-setupwizard-photos-access-page #navButtons omv-submit-button button');
      // Loop through all buttons and remove disabled class
      buttons.forEach(button => {
       if (button.classList.contains('mat-button-disabled')) {
         button.classList.remove('mat-button-disabled');
         button.removeAttribute('disabled');
       }
     });
  
    }

  
}
