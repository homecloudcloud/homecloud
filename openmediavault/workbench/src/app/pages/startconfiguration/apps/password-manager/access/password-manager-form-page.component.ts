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
  selector:'omv-password-manager-access-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="password-manager-access-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./password-manager-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPasswordManagerConfigComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private vaultwardenStatus: string = '';
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getVaultwardenServiceStatus'
      }
    },
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Vaultwarden Backend service runs on Homecloud and stores saved data.')
      },
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Vaultwarden backend service status'),
        hint: gettext('If status is "Not deployed" , go to password manager page and deploy it first. If status is "Down", go to status page and restart the service.'),
        value: '',
        readonly: true
      },
      {
        type:'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext('There are two methods to access Vaultwarden: ')
          },
          {
            type: 'paragraph',
            title: gettext('1. WebBrowser: Used for initial setup and on-going administrative tasks like user creation, password export etc')
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
            title: gettext(`2. Mobile App, Browser extensions: Installed on your access devices like computers, phones to store and access your data. Install app from below links. Open app . Paste the below URL to begin:`)
          },
          {
            type: 'paragraph',
            title: gettext(`<a href="https://play.google.com/store/apps/details?id=com.x8bit.bitwarden" target="_blank"><img src="/assets/images/immich-google-play-badge.png" style="width:50%;"/></a>`)
          },
          {
            type: 'paragraph',
            title: gettext(`<a href="https://apps.apple.com/us/app/bitwarden-password-manager/id1137397744" target="_blank"><img src="/assets/images/immich-ios-app-store.png" style="width:50%;margin:-1%;"/></a>`)
          },
          {
            type: 'paragraph',
            title: gettext(`Browser extensions: Recommended for Windows, MacOS and Linux computers&nbsp;&nbsp;<a class="plainLink" href="https://bitwarden.com/download/" target="_blank">Download Browser Extensions</a>`)
          },
          {
            type: 'paragraph',
            title: gettext(`Open the installed app or browser extension`)
          },
          {
            type: 'textInput',
            name: 'api_endpoint',
            label: gettext('Bitwarden Server Endpoint URL'),
            hint: gettext('Paste this in Mobile App when prompted to access Vaultwarden'),
            value: '',
            readonly: true,
            hasCopyToClipboardButton: true
          },
          {
            type: 'paragraph',
            title: gettext(`To know more features and how to use read documentation at:&nbsp;&nbsp; <a class="plainLink" href="https://bitwarden.com/help/" target="_blank">User Guide </a>`)
          }
        ]
      }
      
      
    ]
  };

  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();
    
    
  }
  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getVaultwardenServiceStatus').subscribe(response => {
      this.vaultwardenStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure
      

      this.updateFieldColors(this.vaultwardenStatus);  //Update colors based on status

      //Update title with hostname
      this.config.fields[2].fields[2].title=`To begin using Vaultwarden: Start with creating first user via web interface at this link <a class="vaultwarden-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Vaultwarden WebApp</a>`;
      
      //Disable button if status is "Down" or "Starting"
      if(this.vaultwardenStatus !== 'Running'){
        this.config.fields[2].fields[2].title=`To begin using Vaultwarden: Start with creating first user via web interface at this link <a class="vaultwarden-btn disabled-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Vaultwarden WebApp</a>`;
      }
      
      // Sanitize the title 
      this.config.fields[2].fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[2].title) as unknown as string;
      this.config.fields[2].fields[6].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[6].title) as unknown as string;
      this.config.fields[2].fields[7].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[7].title) as unknown as string;
      this.config.fields[2].fields[8].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[8].title) as unknown as string;
      this.config.fields[2].fields[11].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].fields[11].title) as unknown as string;
      
      this.addSanitizedHtml();
      this.updateFieldVisibility(this.vaultwardenStatus);
    });
  }
  addSanitizedHtml(){
     // Select all paragraph elements (assuming they are rendered as `ios-drive-form1 omv-form-paragraph` elements)
     const paragraphs = document.querySelectorAll('#password-manager-access-form1 .omv-form-container .omv-form-paragraph');

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
     (this.config.fields[2].fields[8].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[2].fields[8].title?.toString();
     paragraphs[10].innerHTML =
     (this.config.fields[2].fields[11].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[2].fields[11].title?.toString();
     

  }
  updateFieldColors(status:string):void{
    console.log('updating field colors');
    const element = document.querySelector('#password-manager-access-form1 omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element){
      console.log('element found', element);
      if(status === 'Running'){
        console.log('Adding green removing red');
        element.classList.add('greenvaultwardenstatus');
        element.classList.remove('redvaultwardenstatus');
      }else{
        console.log('Adding red removing green');
        element.classList.add('redvaultwardenstatus');
        element.classList.remove('greenvaultwardenstatus');
        
      }
    }
  }

  updateFieldVisibility(status:string):void{
    console.log('updating field visibility');
    const container = document.querySelector('#password-manager-access-form1 .omv-form-container');
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
