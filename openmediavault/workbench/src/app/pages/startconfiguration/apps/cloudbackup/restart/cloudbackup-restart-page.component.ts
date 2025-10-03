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
  selector:'omv-cloudbackup-restart-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `<div id="cloudbackup-restart-form">
              <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
            </div>
  <omv-intuition-form-page id="cloudbackup-restart-form1" [config]="this.config"></omv-intuition-form-page>
            <!--div id="cloudbackup-restart-form3">
                        <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
                      </div-->
  <!--omv-intuition-form-page id="cloudbackup-restart-form2" [config]="this.config2"></omv-intuition-form-page-->
  `,
  styleUrls: ['./cloudbackup-restart-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsCloudbackupRestartComponent extends BaseFormPageComponent {
  //private hostname: string = '';
  private duplicatiStatus: string = '';
  public safeHtmlContent:SafeHtml;
 
  private htmlContent=`<h1>Duplicati Status</h1>
                       <p>Duplicati backend service runs on Homecloud.</p>`;
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getDuplicatiServiceStatus'
      }
    },
    fields: [
      
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Duplicati backend service status'),
        hint: gettext('If service is down then you would not be able to use Duplicati'),
        value: '',
        readonly: true
      }
    ],
    buttons: [
      {
        text: 'Restart Duplicati Backend Service',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'restart_duplicati',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Restarting service',
            successNotification: 'Service restarted',
            successUrl: '/startconfiguration/apps/cloudbackup'
          }
        }
      },
    ]
  };

 
  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();   
    //Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    //this.safeHtmlContent1 = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent1);

  }
  ngOnInit(){
    //console.log('ngOnInit called');
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getDuplicatiServiceStatus').subscribe(response => {
     // this.hostname = response.hostname; // Adjust based on API response structure
      this.duplicatiStatus = response.status;
      this.updateFieldColors(this.duplicatiStatus);  //Update colors based on status
      this.updateFieldVisibility(this.duplicatiStatus);//enable or disable button based on status
     
    });
  }
  
  updateFieldColors(status:string):void{
    console.log('updating field colors');
    const element = document.querySelector('#cloudbackup-restart-form1 omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element){
      //console.log('element found', element);
      if(status === 'Running'){
        ///console.log('Adding green removing red');
        element.classList.add('greenappstatus');
        element.classList.remove('redappstatus');
      }else{
       // console.log('Adding red removing green');
        element.classList.add('redappstatus');
        element.classList.remove('greenappstatus');
        
      }
    }
  }

  updateFieldVisibility(status:string):void{


    const button = document.querySelector('#cloudbackup-restart-form1 mat-card-actions button');
    if(button){
      //console.log('button found', button);
      if(status === 'Not deployed'){
      //  console.log('Disabling button');
        button.classList.add('disabled-btn');
      }
      else{
       // console.log('Enabling button');
        button.classList.remove('disabled-btn');
      }
    }
    
  
  }

}
