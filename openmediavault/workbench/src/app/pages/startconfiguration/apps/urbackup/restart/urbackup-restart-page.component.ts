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
  selector:'omv-urbackup-restart-page',
  template: `<div id="urbackup-restart-form">
              <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
            </div>
  <omv-intuition-form-page id="urbackup-restart-form1" [config]="this.config"></omv-intuition-form-page>
            <!--div id="urbackup-restart-form3">
                        <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
                      </div-->
  <!--omv-intuition-form-page id="urbackup-restart-form2" [config]="this.config2"></omv-intuition-form-page-->
  `,
  styleUrls: ['./urbackup-restart-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AppsUrbackupRestartComponent extends BaseFormPageComponent {
  //private hostname: string = '';
  private urbackupStatus: string = '';
  public safeHtmlContent:SafeHtml;
 
  private htmlContent=`<h1>UrBackup Status</h1>
                       <p>UrBackup backend service runs on Homecloud.</p>`;
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getUrbackupServiceStatus'
      }
    },
    fields: [
      
      {
        type: 'textInput',
        name: 'status',
        label: gettext('UrBackup backend service status'),
        hint: gettext('If service is down then you would not be able to use UrBackup'),
        value: '',
        readonly: true
      }
    ],
    buttons: [
      {
        text: 'Restart UrBackup Backend Service',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'restart_urbackup',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Restarting service',
            successNotification: 'Service restarted',
            successUrl: '/startconfiguration/apps/urbackup'
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
    this.rpcService.request('Homecloud', 'getUrbackupServiceStatus').subscribe(response => {
     // this.hostname = response.hostname; // Adjust based on API response structure
      this.urbackupStatus = response.status;
      this.updateFieldColors(this.urbackupStatus);  //Update colors based on status
      this.updateFieldVisibility(this.urbackupStatus);//enable or disable button based on status
     
    });
  }
  
  updateFieldColors(status:string):void{
    console.log('updating field colors');
    const element = document.querySelector('#urbackup-restart-form1 omv-form-text-input:nth-of-type(1) .mat-form-field input');
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


    const button = document.querySelector('#urbackup-restart-form1 mat-card-actions button');
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
