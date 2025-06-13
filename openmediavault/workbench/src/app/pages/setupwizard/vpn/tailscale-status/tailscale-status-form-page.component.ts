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
import { Component, ChangeDetectorRef,ViewEncapsulation} from '@angular/core'
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';

import * as _ from 'lodash';
//import { Subscription } from 'rxjs';

import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
//import { Unsubscribe } from '~/app/decorators';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  
  selector:'omv-tailscale-status-page', //Home cloud changes
  template: `
  <omv-intuition-form-page id="status-form" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="data-message-form" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-datatable-page  id="data-table-form" [config]="this.config1"></omv-intuition-datatable-page>
  `,
  styleUrls: ['./tailscale-status-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})


export class TailscaleStatusComponent extends BaseFormPageComponent {
  /*
  @Unsubscribe()
  private subscriptions: Subscription = new Subscription();
  */

  public config1: DatatablePageConfig = {
    stateId: '66d9d3ca-2fee-11ea-8386-e3eba0cf8f79',
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
          method: 'getConnectedDevicesTailscaleBg',
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
        name: gettext('IP Address'),
        prop: 'ip_address',
        flexGrow: 1,
        sortable: false
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
        label: gettext('Tailscale VPN Status'),
        hint: gettext('Up denotes VPN is configured and working. Down indicates either VPN is not configured or requires reconfiguration. Homecloud is not accessible over VPN when status is Down.'),
        value: '',
        /*
        validators: {
          patternType: 'hostName'
        },
        */
        readonly: true
      },
      {
        type: 'textInput',
        name: 'user',
        label: gettext('Tailscale account name currently logged in'),
        hint: gettext('Only visible when VPN status is Up'),
        value: '',
        /*
        validators: {
          patternType: 'email'
        },
        */
        readonly: true
      },
      {
        type: 'textInput',
        name: 'hostname',
        label: gettext('Fully qualified name on VPN'),
        hint: gettext('Use this name to access Homecloud from other devices over VPN'),
        value: '',
        /*
        validators: {
          patternType: 'hostName'
        },
        */
        readonly: true
      }
    ],

    buttons: [
      {
        text: 'Connect VPN',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        enabledConstraint: {
          operator: '===', arg0: {prop:'status'}, arg1: 'Down'
        },

        execute: {
          type: 'request',
          request: {
            service: 'TailscaleConfig',
            method: 'ConnectVPN',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Connecting to VPN...',
            successNotification: 'Successfully connected to VPN',
            successUrl: '/startconfiguration/vpn'
          }
        }
      },
      {
        text: 'Disconnect VPN',
        disabled:false,
        submit:true,
        class:'omv-background-color-pair-primary',
        enabledConstraint: {
            operator: '===', arg0: { prop: 'status' },arg1:'Up'
        },
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: "Warning: Disconnecting will have following impact:"+
                   "Access to HomeCloud over VPN will get disabled.You can still connect to HomeCloud using the IP address shown on the HomeCloud display but only if you are on your local network."+
                   "All app users will be logged out. Additionally, devices will require reconfiguration of the apps."+
                   "Are you sure you want to disconnect?"


        },
        execute: {
          type: 'request',
          request: {
            service: 'tailscaleconfig',
            method: 'DisconnectVPN',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Disconnecting from VPN...',
            successNotification: 'Successfully disconnected from VPN',
            successUrl: '/startconfiguration/vpn'
          }
        }
      }
    ],
    
    buttonAlign: 'center' // You can adjust the alignment to 'start', 'center', or 'end'
  };
  public config2: FormPageConfig = {
   
    fields: [
      {
        type: 'paragraph',
        title: gettext('Access devices added to your VPN account will show up below.These devices can connect to Homecloud.')
      }
    ]
    
    
  };

  constructor(private rpcService: RpcService,private cdr:ChangeDetectorRef) {
    super();

  }
  ngOnInit() {
    this.fetchStatusAndUpdateFields();
  }

  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getTailscaleStatus').subscribe(response => {
      const status = response.status; // Adjust based on API response structure
      console.log('status',status);
      this.updateFieldVisibility(status);
      this.updateFieldColors(status);
    });
  }

  updateFieldVisibility(status: string): void {
    const element_mess = document.querySelector('#data-message-form');
    const element_datatable = document.querySelector('#data-table-form');
    if (element_mess) {
      if (status !== 'Up') {
        element_mess.classList.add('hidden'); // Add class to hide the element
        element_datatable.classList.add('hidden'); // Add class to hide the element

      } else {
        element_mess.classList.remove('hidden'); // Remove class to show the element
        element_datatable.classList.remove('hidden'); // Remove class to show the element
      }

      // Force change detection
      this.cdr.detectChanges();

    }
  }
  updateFieldColors(status:string):void{
    const element = document.querySelector('#status-form omv-form-text-input:nth-of-type(1) .mat-form-field input');
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
