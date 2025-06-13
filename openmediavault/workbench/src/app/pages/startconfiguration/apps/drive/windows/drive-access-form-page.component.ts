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
  selector:'omv-drive-access-windows-page', //Home cloud changes
  template: `
  <omv-intuition-form-page id="window-drive-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-datatable-page id="window-drive-data-form" [config]="this.config1"></omv-intuition-datatable-page>
  <omv-intuition-form-page id="window-drive-form2" [config]="this.config2"></omv-intuition-form-page>
  `,

  styleUrls: ['./drive-access-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsDriveWindowsComponent extends BaseFormPageComponent {
  public config1: DatatablePageConfig = {
    stateId: '66d9d3db-2fee-11ea-8386-e3eba0cf8f79',
    autoReload: 10000,
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
          method: 'getConnectedDeviceswindowsTailscaleBg',
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
        title: gettext('First verify that your Windows computer is connected to VPN and is online by checking the below list. If you dont see your computer in the list below go to: <a href="/#/startconfiguration/vpn/access" target="_blank"> &nbsp;&nbsp;Configure VPN on Windows </a>.'),
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
        title:gettext(`Next step: If the above status is Down then go to: <a href="/#/startconfiguration/vpn/tailscaleconfig" target="_blank"> Configure VPN on Homecloud </a>`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext('If status is Up go to File Explorer >> Sidebar >> Network >> Right button click >> Map Network Drive on your Windows computer'),
        name:'paragraph2'
      },
      {
        type: 'paragraph',
        title: gettext(''),
        name:'paragraph3'
      },
      {
        type: 'paragraph',
        title: gettext('Enter two forward slashes followed by fully qualified domain name of Homecloud that can be copied from below >> Enable Reconnect at sign-in >> Connect using different credentials>> Browse >> Enter your credentials when prompted >> Select homes '),
        name:'paragraph4'
      },
      {
        type: 'textInput',
        name: 'hostname',
        label: gettext('Fully qualified domain name on VPN'),
        hint: gettext('Use this name to access Homecloud from other devices over VPN. Copy it and paste in above step.'),
        value: '',
        readonly: true
      },
      {
        type: 'paragraph',
        title: gettext(''),
        name:'paragraph5'
      },
      {
        type: 'paragraph',
        title: gettext('Now you can store and access your personal data.'),
        name:'paragraph6'
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
    });
  }
  
  ngAfterViewInit(): void {
      
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {
      

      // Select all paragraph elements (assuming they are rendered as `window-drive-form1 omv-form-paragraph` elements)
        const paragraphs = document.querySelectorAll('#window-drive-form1 .omv-form-paragraph');

        // Inject the sanitized HTML into the correct paragraph element
        paragraphs[0].innerHTML =
        (this.config.fields[0].title as any).changingThisBreaksApplicationSecurity ||
        this.config.fields[0].title?.toString();

               
       // Select all paragraph elements (assuming they are rendered as `window-drive-form2 omv-form-paragraph` elements)
       const paragraphs2 = document.querySelectorAll('#window-drive-form2 .omv-form-paragraph');
       
       
       // Inject the sanitized HTML into the correct paragraph element
       paragraphs2[0].innerHTML =
       (this.config2.fields[1].title as any).changingThisBreaksApplicationSecurity ||
       this.config2.fields[1].title?.toString();

  
     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  updateFieldColors(status:string):void{
    const element = document.querySelector('#window-drive-form2 omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element){
      if(status === 'Up'){
        element.classList.add('greenstatus');
        element.classList.remove('redstatus');
      }else{
        element.classList.remove('greenstatus');
        element.classList.add('redstatus');
      }
    }
  }



}
