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
  selector:'omv-joplin-access-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="joplin-access-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./joplin-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsJoplinAccessComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private joplinStatus: string = '';
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getJoplinServiceStatus'
      }
    },
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Joplin Backend service runs on Homecloud and stores saved data.')
      },
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Joplin backend service status'),
        hint: gettext(''),
        value: '',
        readonly: true
      },
      {
        type: 'paragraph',
        title: gettext('There are two methods to access Joplin: ')
      },
      {
        type: 'paragraph',
        title: gettext('1. WebBrowser: Used for initial setup, administrative tasks like user creation. Start with WebApp to do first user creation.')
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
        title: gettext(`2. App installed on your access devices: Phones and Computers. Install app from below links. Open app . Paste the below URL to begin:`)
      },
      {
        type: 'paragraph',
        title: gettext(`<a href="https://play.google.com/store/apps/details?id=net.cozic.joplin" target="_blank"><img src="/assets/images/immich-google-play-badge.png" style="width:50%;"/></a>`)
      },
      {
        type: 'paragraph',
        title: gettext(`<a href="https://apps.apple.com/us/app/joplin/id1315599797" target="_blank"><img src="/assets/images/immich-ios-app-store.png" style="width:50%;margin:-1%;"/></a>`)
      },
      {
        type: 'paragraph',
        title: gettext(`Download app for computers inlcuding Windows, Mac and Linux: <a href="https://joplinapp.org/help/install/" target="_blank">&nbsp;&nbsp;Download App for Computers</a>`)
      },
      {
        type: 'paragraph',
        title: gettext(`First time setup like user creation need to be done using WebApp. Initial login id: admin@localhost, password: admin. Change password after first login.`) 
      },
      {
        type: 'paragraph',
        title: gettext(`Open the installed app </a>`)
      },
      {
        type: 'textInput',
        name: 'api_endpoint',
        label: gettext('Joplin Endpoint URL'),
        hint: gettext('Paste this in App when prompted to access Joplin'),
        value: '',
        readonly: true,
        hasCopyToClipboardButton: true
      },
      {
        type: 'paragraph',
        title: gettext(`To know more features and how to use read documentation at: <a href="https://joplinapp.org/help/apps/" target="_blank"> &nbsp;&nbsp;Features</a>`)
      }
      
    ]
  };

  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();
    this.config.fields[8].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[8].title) as unknown as string;
    this.config.fields[9].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[9].title) as unknown as string;
    this.config.fields[10].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[10].title) as unknown as string;
  }
  ngAfterViewInit(): void {
        
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {
      
      // Select all paragraph elements (assuming they are rendered as `photos-main-form1 omv-form-paragraph` elements)
      const paragraphs = document.querySelectorAll('#joplin-access-form1 .omv-form-paragraph');
      
      paragraphs[7].innerHTML =
      (this.config.fields[8].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[8].title?.toString();

      paragraphs[8].innerHTML =
      (this.config.fields[9].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[9].title?.toString();


      paragraphs[9].innerHTML =
      (this.config.fields[11].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[11].title?.toString();

      paragraphs[10].innerHTML =
      (this.config.fields[12].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[12].title?.toString();

   
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getJoplinServiceStatus').subscribe(response => {
      this.joplinStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure
      

      this.updateFieldColors(this.joplinStatus);  //Update colors based on status

      //Update title with hostname
      this.config.fields[4].title=`If accessing first time start here (User: admin@localhost, Password: admin. Change after first use.) <a class="joplin-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Joplin WebApp</a>`;
      
      //Disable button if status is "Down" or "Starting"
      if(this.joplinStatus !== 'Running'){
        this.config.fields[4].title=`If accessing first time start here (User: admin@localhost, Password: admin. Change after first use.) <a class="joplin-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Joplin WebApp</a>`;
      }
      
      // Sanitize the title 
      this.config.fields[4].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[4].title) as unknown as string;
      this.addSanitizedHtml();
      this.config.fields[8].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[8].title) as unknown as string;
      this.addSanitizedHtml();
      this.config.fields[9].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[9].title) as unknown as string;
      this.addSanitizedHtml();
      this.config.fields[10].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[10].title) as unknown as string;
      this.addSanitizedHtml();
    });
  }
  addSanitizedHtml(){
     // Select all paragraph elements (assuming they are rendered as `ios-drive-form1 omv-form-paragraph` elements)
     const paragraphs = document.querySelectorAll('#joplin-access-form1 .omv-form-paragraph');

     // Inject the sanitized HTML into the correct paragraph element
     paragraphs[3].innerHTML =
     (this.config.fields[4].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[4].title?.toString();
     paragraphs[6].innerHTML =
     (this.config.fields[8].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[8].title?.toString();
     paragraphs[7].innerHTML =
     (this.config.fields[9].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[9].title?.toString();
     paragraphs[8].innerHTML =
     (this.config.fields[10].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[10].title?.toString();

  }
  updateFieldColors(status:string):void{
    console.log('updating field colors');
    const element = document.querySelector('#joplin-access-form1 omv-form-text-input:nth-of-type(1) .mat-form-field input');
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

  
}
