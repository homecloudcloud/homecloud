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
  selector:'omv-photos-restart-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="photos-restart-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-restart-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosRestartComponent extends BaseFormPageComponent {
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
        title: gettext('Immich backend service runs on Homecloud and is required to be running for Immich mobile or web app to work.')
      },
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Immich backend service status'),
        hint: gettext('If service is down then you would not be able to use Immich mobile or web app'),
        value: '',
        readonly: true
      }
    ],
    buttons: [
      {
        text: 'Restart Immich Backend Service',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'restart_immich',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Restarting service',
            successNotification: 'Service restarted',
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
    console.log('ngOnInit called');
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getImmichServiceStatus').subscribe(response => {
      this.hostname = response.hostname; // Adjust based on API response structure
      this.immichStatus = response.status;
      console.log('hostname',this.hostname);
      console.log('immichstatus',this.immichStatus);
      this.updateFieldColors(this.immichStatus);  //Update colors based on status
      this.updateFieldVisibility(this.immichStatus);//enable or disable button based on status
      this.config.fields[4].title=`To begin using Immich: Start with creating first admin via web interface at this link <a class="drive-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Immich WebApp</a>`;
      // Sanitize the title 
      this.config.fields[4].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[4].title) as unknown as string;
      this.addSanitizedHtml();
    });
  }
  addSanitizedHtml(){
     // Select all paragraph elements (assuming they are rendered as `ios-drive-form1 omv-form-paragraph` elements)
     const paragraphs = document.querySelectorAll('#photos-config-form1 .omv-form-paragraph');

     // Inject the sanitized HTML into the correct paragraph element
     paragraphs[3].innerHTML =
     (this.config.fields[4].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[4].title?.toString();

  }

  updateFieldColors(status:string):void{
    console.log('updating field colors');
    const element = document.querySelector('#photos-restart-form1 omv-form-text-input:nth-of-type(1) .mat-form-field input');
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


    const button = document.querySelector('#photos-restart-form1 mat-card-actions button');
    if(button){
      console.log('button found', button);
      if(status === 'Not deployed'){
        console.log('Disabling button');
        button.classList.add('disabled-btn');
      }
      else{
        console.log('Enabling button');
        button.classList.remove('disabled-btn');
      }
    }
    
  
  }

}
