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
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { DomSanitizer } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';

@Component({
  selector:'omv-drive-access-android-page', //Home cloud changes
  template: `
  <omv-intuition-form-page id="android-drive-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-datatable-page id="android-drive-data-form" [config]="this.config1"></omv-intuition-datatable-page>
  <omv-intuition-form-page id="android-drive-form2" [config]="this.config2"></omv-intuition-form-page>
  `,
  styleUrls: ['./drive-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsDriveandroidComponent extends BaseFormPageComponent {
  public config1: DatatablePageConfig = {
    stateId: '66d9d3db-2fee-11ea-8386-e3eba0cf8f79',
    autoReload: 90000,
    remoteSorting: true,
    remotePaging: true,
    sorters: [
      {
        dir: 'asc',
        prop: 'name'
      }
    ],
    store: {
      proxy: {
        service: 'Homecloud',
        get: {
          method: 'getConnectedDevicesandroidTailscaleBg',
          task: true
        }
      }
    },
    rowId: 'name',
    columns: [
      {
        name: gettext('Device'),
        prop: 'name',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('OS'),
        prop: 'os',
        sortable: true,
        flexGrow: 1
      },
      {
        name: gettext('Status'),
        prop: 'status',
        flexGrow: 1,
        sortable: true
      }
    ]
  };


  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext(`Verify that your Android device is connected to VPN and is online by checking the below list. If you dont see your device in the list below go to:&nbsp;&nbsp; <a href="#">Configure VPN on Android </a>.`),
        name:'paragraph1'
      }
    ]
  };


  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getTailscaleStatus'

      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Homecloud VPN Status'),
        hint: gettext('Up denotes VPN is configured and working on Homecloud. Down indicates either VPN is not configured or requires reconfiguration.'),
        value: '',
        readonly: true
      },
      {
        type: 'paragraph',
        title:gettext(`Next step: If the above status is Down then go to: &nbsp;&nbsp;<a href="/#/startconfiguration/vpn/status">Connect VPN  </a>. If VPN is not even configured then go to :&nbsp;&nbsp; <a href="/#/startconfiguration/vpn/tailscaleconfig">Configure VPN  </a>`),
        name:'paragraph1'
      },
      {
        type: 'container',
        fields:[
          
          {
            type: 'paragraph',
            title: gettext('On Android you can access Homecloud Drive using any app that support accessing remote server using SMB protocol. In this example we are using a free app named File Manager Plus.')
          },
          {
            type: 'paragraph',
            title: gettext('Go to Play store and install app named File Manager Plus.')
          },
          {
            type: 'paragraph',
            title: gettext('')
          },
          {
            type: 'paragraph',
            title: gettext('Open installed app >> Press Remote >> Add Remote location >> SMB >> Copy Fully Qualified Domain Name from below and paste in Host field >> Enter User name and password >> Press OK ')
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
            type: 'textInput',
            name: 'hostname',
            label: gettext('Fully qualified domain name on VPN'),
            hint: gettext('Use this name to access Homecloud from other devices over VPN. Copy it and paste in above step.'),
            value: '',
            readonly: true,
            hasCopyToClipboardButton:true
          },
          {
            type: 'paragraph',
            title: gettext('')
          },
          {
            type: 'paragraph',
            title: gettext('Now you can store and access your personal data.')
          }
        ]
      }
      
    ]
  };


  constructor(private sanitizer: DomSanitizer,private rpcService: RpcService) {
    super();
   
    // Sanitize the title 
  
        this.config.fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[0].title) as unknown as string;
        this.config2.fields[1].title = this.sanitizer.bypassSecurityTrustHtml(this.config2.fields[1].title) as unknown as string;
   
    
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }

  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getTailscaleStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldColors(status);     //Update colors based on status
      this.updateFieldVisibility(status);     //Hide/Show fields based on status
    });
  }
  ngAfterViewInit(): void {    
     
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {

      // Select all paragraph elements (assuming they are rendered as `android-drive-form1 .omv-form-paragraph` elements)
        const paragraphs = document.querySelectorAll('#android-drive-form1 .omv-form-paragraph');

        // Inject the sanitized HTML into the correct paragraph element
        
        paragraphs[0].innerHTML =
        (this.config.fields[0].title as any).changingThisBreaksApplicationSecurity ||
        this.config.fields[0].title?.toString();

               
       // Select all paragraph elements (assuming they are rendered as `android-drive-form2 .omv-form-paragraph` elements)
       const paragraphs2 = document.querySelectorAll('#android-drive-form2 .omv-form-paragraph');
       
       
       // Inject the sanitized HTML into the correct paragraph element
       paragraphs2[0].innerHTML =
       (this.config2.fields[1].title as any).changingThisBreaksApplicationSecurity ||
       this.config2.fields[1].title?.toString();

  
     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }

  updateFieldColors(status:string):void{
    const element = document.querySelector('#android-drive-form2 omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element instanceof HTMLElement){
      if(status === 'Up'){
        element.classList.add('greenstatus');
        element.classList.remove('redstatus');
      }else{
        element.classList.remove('greenstatus');
        element.classList.add('redstatus');
      }
    }
  }

  updateFieldVisibility(status:string):void{
    const upContainer = document.querySelector('#android-drive-form2 .omv-form-container');
    const downElement = document.querySelector('#android-drive-form2 omv-form-paragraph:nth-of-type(1)');
    const androidForm1 =document.querySelector('#android-drive-form1');
    const androidDriveDataForm =document.querySelector('#android-drive-data-form');
      if(status === 'Up'){
        if(upContainer instanceof HTMLElement){
          upContainer.classList.remove('hidden');
        }
        if(downElement instanceof HTMLElement){
          downElement.classList.add('hidden');
        }
        
      }else{
        if(upContainer instanceof HTMLElement){
          upContainer.classList.add('hidden');
        }
        if(downElement instanceof HTMLElement){
          downElement.classList.remove('hidden');
        }
        if(androidForm1 instanceof HTMLElement && androidDriveDataForm instanceof HTMLElement){
          androidForm1.classList.add('hidden');
          androidDriveDataForm.classList.add('hidden');
        }
       
      
    } 

  }

}
