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
//import { template } from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';

import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';

@Component({
  template:
    `<omv-logo-header></omv-logo-header>
    <omv-intuition-form-page [config]="this.config1" id="desc"></omv-intuition-form-page>
    <omv-intuition-datatable-page #page [config]="this.config" id="mainContent"></omv-intuition-datatable-page>
    <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>
    `,
    styles: [`
    @import '../../../../../assets/colors.scss';

    omv-interface-datatable-page{

      omv-top-bar-wizard .omv-top-bar{
        background:transparent!important;
        position: absolute;
        left:80vw;
    }

      omv-logo-header{
        position:fixed;
        height:20vh;
        top:0;
        left:0;
        z-index:100;
      }
      #desc{
          
        .mat-card{
            margin-top:20vh!important;
            
        }
      }
      #mainContent{
        .mat-card{
          position:relative;
          z-index:1;

          /* Selects last cell in all row groups except the first one */
          .datatable-row-group:not(:first-child) .datatable-body-cell:last-child {
            overflow-x:auto;
          }


        }
      }
      #navButtons{
        .mat-card{
            background-color:$blue!important;
        }
        mat-card-content{
            display:none!important;
        }
        .mat-card-actions{
            justify-content:space-between!important;
            flex-direction:row-reverse!important;
        }
        @media screen and (max-width: 600px) {
          .mat-card-actions{
            flex-direction:column-reverse!important;
            align-items:center!important;
            justify-content:center!important;
            row-gap:20px;
          }
        } 
      } 
    }
    `],
    encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
    selector:'omv-interface-datatable-page'

})
export class InterfaceDatatablePageComponent extends BaseFormPageComponent {
  public config1: FormPageConfig = {
      
      fields: [
       {
          type:'paragraph',   
          title: gettext('Choose the interface you want to configure and click on "Edit" to start the configuration.'),
       }
      ]
     
    };
  public config: DatatablePageConfig = {
    stateId: '1c782151-4393-493b-9767-257620370fb2',
    autoReload: false,
    remoteSorting: true,
    remotePaging: true,
    hasSearchField: true,
    rowEnumFmt: '{{ devicename }}',
    columns: [
      { name: gettext('Device'), prop: 'devicename', flexGrow: 1, sortable: true },
      {
        name: gettext('Type'),
        prop: 'type',
        flexGrow: 1,
        sortable: true,
        hidden: true,
        cellTemplateName: 'chip',
        cellTemplateConfig: {
          map: {
            ethernet: { value: gettext('Ethernet') },
            bond: { value: gettext('Bond') },
            vlan: { value: gettext('VLAN') },
            wifi: { value: gettext('Wi-Fi') },
            bridge: { value: gettext('Bridge') }
          }
        }
      },
      {
        name: gettext('Tags'),
        prop: 'comment',
        cellTemplateName: 'chip',
        cellTemplateConfig: {
          separator: ','
        },
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Status'),
        prop: 'state',
        cellTemplateName: 'checkIcon',
        flexGrow: 1,
        sortable: true
      },
      /*
      {
        name: gettext('Method'),
        prop: 'method',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'template',
        cellTemplateConfig:
          // eslint-disable-next-line max-len
          'IPv4: {{ method | replace("manual", "Disabled") | replace("dhcp", "DHCP") | replace("auto", "Auto") | replace("static", "Static") | translate }}<br>IPv6: {{ method6 | replace("manual", "Disabled") | replace("dhcp", "DHCP") | replace("auto", "Auto") | replace("static", "Static") | translate }}'
      },
      */
      {
        name: gettext('Address'),
        prop: 'address',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'template',
        cellTemplateConfig:
          'IPv4: {{ address | default("-", true) }}<br>IPv6: {{ address6 | default("-", true) }}'
      }
      /*
      {
        name: gettext('Netmask'),
        prop: 'netmask',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'template',
        cellTemplateConfig:
          'IPv4: {{ netmask | default("-", true) }}<br>IPv6: {{ netmask6 | default("-", true) }}'
      },
      {
        name: gettext('Gateway'),
        prop: 'gateway',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'template',
        cellTemplateConfig:
          'IPv4: {{ gateway | default("-", true) }}<br>IPv6: {{ gateway6 | default("-", true) }}'
      },
      { name: gettext('MTU'), prop: 'mtu', flexGrow: 1, sortable: true },
      {
        name: gettext('WOL'),
        prop: 'wol',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'checkIcon'
      }
      */
    ],
    sorters: [
      {
        dir: 'asc',
        prop: 'devicename'
      }
    ],
    store: {
      proxy: {
    //    service: 'Network',
        service: 'Homecloud',
        get: {
    //      method: 'getInterfaceList'
           method: 'enumerateConfiguredDevicesWithStatus',
            params:{
              start: 0,
              limit: -1            
            }
  
            
        }
      }
    },
    actions: [
      /*
      {
        type: 'menu',
        icon: 'add',
        tooltip: gettext('Create'),
        actions: [
          {
            text: gettext('Ethernet'),
            icon: 'mdi:ethernet',
            execute: {
              type: 'url',
              url: '/startconfiguration/networkconfig/interfaces/ethernet/create'
            }
          },
          {
            text: gettext('Wi-Fi'),
            icon: 'mdi:wifi',
            execute: {
              type: 'url',
              url: '/startconfiguration/networkconfig/interfaces/wifi/create'
            }
          },
          {
            text: gettext('Bond'),
            icon: 'mdi:link-variant',
            execute: {
              type: 'url',
              url: '/startconfiguration/networkconfig/interfaces/bond/create'
            }
          },
          {
            text: gettext('VLAN'),
            icon: 'mdi:lan',
            execute: {
              type: 'url',
              url: '/startconfiguration/networkconfig/interfaces/vlan/create'
            }
          },
          {
            text: gettext('Bridge'),
            icon: 'mdi:bridge',
            execute: {
              type: 'url',
              url: '/startconfiguration/networkconfig/interfaces/bridge/create'
            }
          }
        ]
      },
      */
      {
        template: 'edit',
        execute: {
          type: 'url',
          //url: '/startconfiguration/networkconfig/interfaces/{{ _selected[0].type }}/edit/{{ _selected[0].uuid }}'
          url: '/setupwizard/networkconfig/interfaces/{{ _selected[0].type }}/edit/{{ _selected[0].uuid }}'
        }
      }
     /* },
      {
        type: 'iconButton',
        icon: 'details',
        tooltip: gettext('Show details'),
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1
        },
        execute: {
          type: 'url',
          url: '/setupwizard/networkconfig/interfaces/details/{{ _selected[0].devicename }}'
        }
      },
      {
        type: 'iconButton',
        icon: 'search',
        tooltip: gettext('Identify'),
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1,
          constraint: [{ operator: 'eq', arg0: { prop: 'type' }, arg1: 'ethernet' }]
        },
        execute: {
          type: 'formDialog',
          formDialog: {
            title: gettext('Identify network interface'),
            fields: [
              {
                type: 'textInput',
                name: 'devicename',
                label: gettext('Name'),
                readonly: true,
                value: '{{ _selected[0].devicename }}'
              },
              {
                type: 'numberInput',
                name: 'seconds',
                label: gettext('Seconds'),
                hint: gettext(
                  'Length of time in seconds to blink one or more LEDs on the specific ethernet port.'
                ),
                validators: {
                  required: true,
                  min: 1,
                  max: 30,
                  patternType: 'integer'
                },
                value: 10
              }
            ],
            buttons: {
              submit: {
                text: gettext('Start'),
                execute: {
                  type: 'request',
                  request: {
                    service: 'Network',
                    method: 'identify',
                    task: true,
                    progressMessage: gettext('Please wait, identifying network device ...')
                  }
                }
              }
            }
          }
        }
      }
      */
     
    ]
  };
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Setup Main Page',
        execute:
        {
          type:'url',
          url:'/setupwizard'
        }
        
      },
      {template:'submit',
        text:'Next: VPN >',
        execute: {
    /*      type: 'url',
          url: '/setupwizard/vpn/tailscaleconfig'
    */
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkNetworkInterfaceStatusForWizard',
            task:false,
            progressMessage:gettext('Please wait, checking Network Connection ...'),
            successUrl:'/setupwizard/vpn/tailscaleconfig',
            
          }
        }
      }
    ]

  };

}
