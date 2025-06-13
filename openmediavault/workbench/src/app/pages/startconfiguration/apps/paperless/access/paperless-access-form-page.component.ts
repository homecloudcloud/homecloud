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
import { DomSanitizer } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-paperless-access-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="paperless-access-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="paperless-access-form2" [config]="this.config2"></omv-intuition-form-page>
  `,
  styleUrls: ['./paperless-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsPaperlessAccessComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private paperlessStatus: string = '';
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getPaperlessServiceStatus'
      }
    },
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Paperless-ngx Backend service runs on Homecloud and stores saved data.')
      },
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Paperless-ngx backend service status'),
        hint: gettext('If status is "Not deployed" , go to Documents page and deploy it first. If status is "Down", go to status page and restart the service.'),
        value: '',
        readonly: true
      },
      {
        type:'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext('There are two methods to access Paperless-ngx: ')
          },
          {
            type: 'paragraph',
            title: gettext('1. WebBrowser: Used for initial setup, administrative  tasks like permissions, sharing and regular on-going access')
          },
          {
            type: 'paragraph',
            title: gettext('')
          },
          {
            type: 'paragraph',
            title: gettext('')
          },
          {
            type: 'paragraph',
            title: gettext('')
          },
          {
            type: 'paragraph',
            title: gettext(`2. Mobile App installed on your access devices: phones and WebApp for computers. Install app from below links. Open app . Paste the below URL to begin:`)
          },
          {
            type: 'paragraph',
            title: gettext(`<a href="https://play.google.com/store/apps/details?id=de.astubenbord.paperless_mobile" target="_blank"><img src="/assets/images/immich-google-play-badge.png" style="width:50%;"/></a>`)
          },
          {
            type: 'paragraph',
            title: gettext(`<a href="https://apps.apple.com/us/app/swift-paperless/id6448698521" target="_blank"><img src="/assets/images/immich-ios-app-store.png" style="width:50%;margin:-1%;"/></a>`)
          },
          {
            type: 'paragraph',
            title: gettext(`Native WebApp is a good alternative that can be used on all devices `)
          },
          {
            type: 'paragraph',
            title: gettext(`Open the installed app`)
          },
          {
            type: 'textInput',
            name: 'api_endpoint',
            label: gettext('Paperless-ngx Endpoint URL'),
            hint: gettext('Paste this in Mobile App when prompted to access Paperless-ngx'),
            value: '',
            readonly: true,
            hasCopyToClipboardButton: true
          },
          {
            type: 'paragraph',
            title: gettext(`To know more features and how to use read documentation at:&nbsp;&nbsp; <a class="plainLink" href="https://docs.paperless-ngx.com/#features" target="_blank">Features</a>`)
          }

        ]
      }
      
      
    ]
  };

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        params:{
          appname: 'paperless-ngx'
        },
        method: 'getFunnelStatus'
      }   
    },
    fields: [  
      {
        type: 'paragraph',
        title: gettext('You can also share your documents with friends, family that are not on your family tailscale VPN. This is enabled via Tailscale funnel service. This enables Immich app to be accessed from Internet without needing VPN connectivity. This comes with security risks so only use it for limited time. Before enabling make sure you are using strong passwords for paperless-ngx.')
      },
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Internet sharing status'),
        hint: gettext('If enabled, then paperless-ngx is accessible from public internet without VPN. Only enable if you understand the risks.'),
        value: '',
        readonly: true
      },
      {
        type: 'textInput',
        name: 'url',
        label: gettext('Internet access link for non-VPN users'),
        hint: gettext('This is the link to access paperless-ngx over internet for non-VPN users. Only visible if status is Enabled.'),
        value: '',
        readonly: true
      }
    ],
    buttons: [
      {
        text: 'Enable sharing Paperless-ngx on public Internet for non-VPN users)',
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
                  source_port: 8443,
                  destination_port: 8000
                }
              }
            },
          successUrl:'/startconfiguration/apps/paperless'
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
                  source_port: 8443,
                  destination_port: 8000
                }
              }
            },
          successUrl:'/startconfiguration/apps/paperless'
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
    this.rpcService.request('Homecloud', 'getPaperlessServiceStatus').subscribe(response => {
      this.paperlessStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure
      

      this.updateFieldColors(this.paperlessStatus);  //Update colors based on status

      //Update title with hostname
      this.config.fields[2].fields[2].title=`If accessing first time start here (User: admin, Password: shown during deployment. If forgotten reset from Password page.) <a class="paperless-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Paperless-ngx WebApp</a>`;
      
      //Disable button if status is "Down" or "Starting"
      if(this.paperlessStatus !== 'Running'){
        this.config.fields[2].fields[2].title=`If accessing first time start here (User: admin, Password: shown during deployment. If forgotten reset from Password page.) <a class="paperless-btn disabled-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Paperless-ngx WebApp</a>`;
      }
      
      // Sanitize the title 
      this.config.fields[2].fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[2].title) as unknown as string;
      this.config.fields[2].fields[6].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[6].title) as unknown as string;
      this.config.fields[2].fields[7].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[7].title) as unknown as string;
      this.config.fields[2].fields[11].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[11].title) as unknown as string;
      this.addSanitizedHtml();
      this.updateFieldVisibility(this.paperlessStatus);
    });
  }
  addSanitizedHtml(){
     // Select all paragraph elements (assuming they are rendered as `ios-drive-form1 omv-form-paragraph` elements)
     const paragraphs = document.querySelectorAll('#paperless-access-form1 .omv-form-container .omv-form-paragraph');

     // Inject the sanitized HTML into the correct paragraph element
     paragraphs[2].innerHTML =
     (this.config.fields[2].fields[2].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[2].fields[2].title?.toString();
     paragraphs[6].innerHTML =
     (this.config.fields[2].fields[6].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[2].fields[6].title?.toString();
     paragraphs[7].innerHTML =
     (this.config.fields[2].fields[7].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[2].fields[7].title?.toString();
     paragraphs[10].innerHTML =
     (this.config.fields[2].fields[11].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[2].fields[11].title?.toString();

  }
  updateFieldColors(status:string):void{
    console.log('updating field colors');
    const element = document.querySelector('#paperless-access-form1 omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element){
      console.log('element found', element);
      if(status === 'Running'){
        console.log('Adding green removing red');
        element.classList.add('greenpaperlessstatus');
        element.classList.remove('redpaperlessstatus');
      }else{
        console.log('Adding red removing green');
        element.classList.add('redpaperlessstatus');
        element.classList.remove('greenpaperlessstatus');
        
      }
    }
  }
  updateFieldVisibility(status:string):void{
    console.log('updating field visibility');
    const container = document.querySelector('#paperless-access-form1 .omv-form-container');
    if(container){
      console.log('container found', container);
      if(status === 'Not deployed'){
        container.classList.add('hidden');
      }else{
      container.classList.remove('hidden');
        
      }
    }
  }

  
}
