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
  selector:'omv-setupwizard-photos-access-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <omv-intuition-form-page id="photos-config-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="photos-config-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-config-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosConfigComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private immichStatus: string = '';
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getImmichServiceStatus'
      }
    },
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Immich Backend service runs on Homecloud and stores, indexes photos.')
      },
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Immich backend service status'),
        hint: gettext('If status is "Not deployed" , go to photos page and deploy it first. If status is "Down", go to status page and restart the service.'),
        value: '',
        readonly: true
      },
      {
        type: 'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext('There are two methods to access Immich: ')
          },
          {
            type: 'paragraph',
            title: gettext('1. WebBrowser: Used for initial setup and on-going administrative tasks like user creation, assigning quotas, face merging, indexing pictures on plugged in external USB disks')
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
            title: gettext(`2. Mobile App: Before using app user id need to be created from WebApp as outlined above. Install app from below links. After creating first user open Mobile app on phone. It will ask for endpoint URL. Paste the below URL to begin:`)
          },
          {
            type: 'paragraph',
            title: gettext(`<a href="https://play.google.com/store/apps/details?id=app.alextran.immich" target="_blank"><img src="/assets/images/immich-google-play-badge.png" style="width:50%;margin:-1%;"/></a>`)
          },
          {
            type: 'paragraph',
            title: gettext(`<a href="https://apps.apple.com/sg/app/immich/id1613945652" target="_blank"><img src="/assets/images/immich-ios-app-store.png" style="width:50%;margin:-1%;"/></a>`)
          },
          {
            type: 'textInput',
            name: 'api_endpoint',
            label: gettext('Immich Server Endpoint URL'),
            hint: gettext('Paste this in Mobile App when prompted to access Immich'),
            value: '',
            readonly: true,
            hasCopyToClipboardButton: true
          },
          {
            type: 'paragraph',
            title: gettext(`To learn more about Immich features visit open source project at:&nbsp;&nbsp; <a class="plainLink" href="https://immich.app/" target="_blank">Immich App Project </a>`)
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
          appname: 'immich'
        },
        method: 'getFunnelStatus'
      }   
    },
    fields: [  
      {
        type: 'paragraph',
        title: gettext('You can also share your photos with friends, family that are not on your family tailscale VPN. This is enabled via Tailscale funnel service. This enables Immich app to be accessed from Internet without needing VPN connectivity. This comes with security risks so only use it for limited time to share photos. Before enabling make sure you are using strong passwords for Immich.')
      },
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
        label: gettext('Internet access link'),
        hint: gettext('This is the link to access Immich over internet without VPN. Only visible if status is Enabled.'),
        value: '',
        readonly: true
      }
    ],
    buttons: [
      {
        text: 'Enable sharing Immich Photo app on public Internet for external users)',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'CAUTION! This may increase risk of unauthorized access as Homecloud will become accessible from Internet without VPN. Do you really want to continue? '
        },
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'createTailscaleFunnel',
            params:{
              source_port: 10000,
              destination_port: 2284
            },
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Enabling direct Internet access for Immich Photo App',
            successNotification: 'Immich can be now accessed without VPN from Public Internet',
            successUrl: '/startconfiguration/apps/photos'
          }
        }
      },
      {
        text: 'Disable Internet sharing',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'disableTailscaleFunnel',
            params:{
              source_port: 10000,
              destination_port: 2284
            },
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Disable direct Internet access',
            successNotification: 'Disabled direct internet access',
            successUrl: '/startconfiguration/apps/photos'
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
      this.immichStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure
      console.log('immichstatus',this.immichStatus);
      console.log('hostname',this.hostname);

      this.updateFieldColors(this.immichStatus);  //Update colors based on status

      //Update title with hostname
      this.config.fields[2].fields[2].title=`To begin using Immich: Start with creating first user via web interface at this link <a class="immich-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Immich WebApp</a>`;
      
      //Disable button if status is "Down" or "Starting"
      if(this.immichStatus !== 'Running'){
        this.config.fields[2].fields[2].title=`To begin using Immich: Start with creating first user via web interface at this link <a class="immich-btn disabled-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Immich WebApp</a>`;
      }
      
      // Sanitize the title 
      this.config.fields[2].fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[2].title) as unknown as string;
      this.config.fields[2].fields[6].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[6].title) as unknown as string;
      this.config.fields[2].fields[7].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[7].title) as unknown as string;
      this.config.fields[2].fields[9].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[9].title) as unknown as string;
    
      this.addSanitizedHtml();
      this.updateFieldVisibility(this.immichStatus);
      
    });
  }
  addSanitizedHtml(){
     // Select all paragraph elements 
     const paragraphs = document.querySelectorAll('#photos-config-form1 .omv-form-container .omv-form-paragraph');
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

      paragraphs[8].innerHTML =
      (this.config.fields[2].fields[9].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[2].fields[9].title?.toString();
     
  }
  updateFieldColors(status:string):void{
    console.log('updating field colors');
    const element = document.querySelector('#photos-config-form1 omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element){
      console.log('element found', element);
      if(status === 'Running'){
        console.log('Adding green removing red');
        element.classList.add('greenimmichstatus');
        element.classList.remove('redimmichstatus');
      }else{
        console.log('Adding red removing green');
        element.classList.add('redimmichstatus');
        element.classList.remove('greenimmichstatus');
        
      }
    }
  }
  updateFieldVisibility(status:string):void{
    console.log('updating field visibility');
    const container = document.querySelector('#photos-config-form1 .omv-form-container');
    if(container){
      console.log('container found', container);
      if(status === 'Not deployed'){
        container.classList.add('hidden');
      }else{
      container.classList.remove('hidden');
        
      }
    }
  }
  public navConfig: FormPageConfig = {
  
      fields:[
        
      ],
      buttons: [
        
        {template:'submit',
          text:'<< Go Back: Photos app Set Up',
          execute:
          {
            type:'url',
            url:'/setupwizard/apps/photos'
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
