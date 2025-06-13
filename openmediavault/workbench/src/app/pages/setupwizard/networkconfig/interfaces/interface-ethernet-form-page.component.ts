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

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';

@Component({
  template: `<omv-logo-header></omv-logo-header>
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>
             `,
  styles: [`
    @import '../../../../../assets/colors.scss';
    omv-interface-ethernet-form-page{

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

      #mainContent{
        .mat-card{
          margin-top:12rem;
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
            justify-content:flex-end!important;          
        } 
      } 
    }
  `],
  encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
  selector:'omv-interface-ethernet-form-page'  //Home cloud changes
})
export class InterfaceEthernetFormPageComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'Network',
      get: {
        method: 'getEthernetIface',
        params: {
          uuid: '{{ _routeParams.uuid }}'
        }
      },
      post: {
        method: 'setEthernetIface'
      }
    },
    fields: [
      {
        type: 'confObjUuid'
      },
      {
        type: 'select',
        name: 'type',
        label: gettext('Type'),
        disabled: true,
        submitValue: false,
        value: 'ethernet',
        store: {
          data: [
            ['ethernet', gettext('Ethernet')],
            ['bond', gettext('Bond')],
            ['vlan', gettext('VLAN')],
            ['wifi', gettext('Wi-Fi')],
            ['bridge', gettext('Bridge')]
          ]
        }
      },
      {
        type: 'select',
        name: 'devicename',
        label: gettext('Device'),
        placeholder: gettext('Select a device ...'),
        textField: 'description',
        valueField: 'devicename',
        store: {
          proxy: {
            service: 'Network',
            get: {
              method:
                '{{ "enumerateDevices" if _routeConfig.data.editing else "getEthernetCandidates" }}'
            }
          },
          sorters: [
            {
              dir: 'asc',
              prop: 'devicename'
            }
          ]
        },
        value: '',
        disabled: '{{ _routeConfig.data.editing | toboolean }}',
        validators: {
          required: true
        }
      },
      {
        type: 'tagInput',
        name: 'comment',
        label: gettext('Tags'),
        value: '',
        modifiers: [
          {
            type:'hidden'
          }
        ]
        
      },
      {
        type: 'divider',
        title: gettext('IPv4')
      },
      {
        type: 'select',
        name: 'method',
        label: gettext('Method'),
        //value: 'manual',
        value:'dhcp',
        store: {
          data: [
            ['manual', gettext('Disabled')],
            ['dhcp', gettext('DHCP')],
            ['static', gettext('Static')]
          ]
        },
        validators: {
          required: true
        }
      },
      {
        type: 'textInput',
        name: 'address',
        label: gettext('Address'),
        value: '',
        validators: {
          patternType: 'ipv4',
          requiredIf: { operator: 'eq', arg0: { prop: 'method' }, arg1: 'static' }
        },
        modifiers: [
          {
            type: 'disabled',
            constraint: { operator: 'ne', arg0: { prop: 'method' }, arg1: 'static' }
          }
        ]
      },
      {
        type: 'textInput',
        name: 'netmask',
        label: gettext('Netmask'),
        value: '',
        validators: {
          patternType: 'netmask',
          requiredIf: { operator: 'eq', arg0: { prop: 'method' }, arg1: 'static' }
        },
        modifiers: [
          {
            type: 'disabled',
            constraint: { operator: 'ne', arg0: { prop: 'method' }, arg1: 'static' }
          }
        ]
      },
      {
        type: 'container',
        fields: [
          {
            type: 'textInput',
            name: 'gateway',
            label: gettext('Gateway'),
            value: '',
            validators: {
              patternType: 'ipv4'
            },
            modifiers: [
              {
                type: 'disabled',
                constraint: { operator: 'ne', arg0: { prop: 'method' }, arg1: 'static' }
              }
            ],
            flex: 75
          },
          {
            type: 'numberInput',
            name: 'routemetric',
            label: gettext('Metric'),
            value: 0,
            validators: {
              min: 0,
              max: 65535,
              patternType: 'integer'
            },
            modifiers: [
              {
                type: 'disabled',
                constraint: { operator: 'ne', arg0: { prop: 'method' }, arg1: 'static' }
              }
            ]
          }
        ]
      },

    /*  {
        type: 'divider',
        title: gettext('IPv6'),
        modifiers: [
          {
            type:'hidden'
          }
        ]
      },
      */
      {
        type: 'select',
        name: 'method6',
        label: gettext('Method'),
        value: 'manual',
        store: {
          data: [
            ['manual', gettext('Disabled')],
            ['dhcp', gettext('DHCP')],
            ['auto', gettext('Auto')],
            ['static', gettext('Static')]
          ]
        },
        validators: {
          required: true
        },
        modifiers: [
          {
            type:'hidden'
          }
        ]
      },
      {
        type: 'textInput',
        name: 'address6',
        label: gettext('Address'),
        value: '',
        validators: {
          patternType: 'ipv6',
          requiredIf: { operator: 'eq', arg0: { prop: 'method6' }, arg1: 'static' }
        },
        modifiers: [
          {
           // type: 'disabled',
           type:'hidden',
            constraint: { operator: 'ne', arg0: { prop: 'method6' }, arg1: 'static' }
          }
        ]
      },
      {
        type: 'numberInput',
        name: 'netmask6',
        label: gettext('Prefix length'),
        value: 64,
        validators: {
          min: 0,
          max: 128,
          patternType: 'integer',
          requiredIf: { operator: 'eq', arg0: { prop: 'method6' }, arg1: 'static' }
        },
        modifiers: [
          {
           // type: 'disabled',
            type: 'hidden',
            constraint: { operator: 'ne', arg0: { prop: 'method6' }, arg1: 'static' }
          }
        ]
      },
      {
        type: 'container',
        modifiers: [
          {
            type:'hidden'
          }
        ],
        fields: [
          {
            type: 'textInput',
            name: 'gateway6',
            label: gettext('Gateway'),
            value: '',
            validators: {
              patternType: 'ipv6'
            },
            modifiers: [
              {
        //        type: 'disabled',
                type: 'hidden',
                constraint: { operator: 'ne', arg0: { prop: 'method6' }, arg1: 'static' }
              }
            ],
            flex: 75
          },
          {
            type: 'numberInput',
            name: 'routemetric6',
            label: gettext('Metric'),
            value: 1,
            validators: {
              min: 0,
              max: 65535,
              patternType: 'integer'
            },
            modifiers: [
              {
         //       type: 'disabled',
                type: 'hidden',
                constraint: { operator: 'ne', arg0: { prop: 'method6' }, arg1: 'static' }
              }
            ]
          }
        ]
      },
   /*   {
        type: 'divider',
        title: gettext('Advanced settings'),
        modifiers: [
          {
            type:'hidden'
          }
        ]
      },
    */
      {
        type: 'textInput',
        name: 'altmacaddress',
        label: gettext('MAC address'),
        hint: gettext('Force a specific MAC address on this interface.'),
        value: '',
        validators: {
          patternType: 'macAddress'
        },
        modifiers: [
          {
            type:'hidden'
          }
        ]
      },
      {
        type: 'textInput',
        name: 'dnsnameservers',
        label: gettext('DNS servers'),
        hint: gettext('IP addresses of domain name servers used to resolve host names.'),
        value: '',
        validators: {
          patternType: 'ipList'
        },
        modifiers: [
          {
            type:'hidden'
          }
        ]
      },
      {
        type: 'textInput',
        name: 'dnssearch',
        label: gettext('Search domains'),
        hint: gettext('Domains used when resolving host names.'),
        value: '',
        validators: {
          patternType: 'domainNameList'
        },
        modifiers: [
          {
            type:'hidden'
          }
        ]
      },
      {
        type: 'numberInput',
        name: 'mtu',
        label: gettext('MTU'),
        hint: gettext(
          'The maximum transmission unit in bytes to set for the device. Set to 0 to use the default value.'
        ),
        value: 0,
        validators: {
          min: 0,
          max: 65535,
          patternType: 'integer'
        },
        modifiers: [
          {
            type:'hidden'
          }
        ]
      },
      {
        type: 'checkbox',
        name: 'wol',
        label: gettext('Wake-on-LAN'),
        value: false,
        modifiers: [
          {
            type:'hidden'
          }
        ]
      }
  
    ],
    buttons: [
      {
        template: 'submit',
        execute: {
          type: 'url',
          url: '/setupwizard/networkconfig/interfaces'
        }
      },
      {
        template: 'cancel',
        execute: {
          type: 'url',
          url: '/setupwizard/networkconfig/interfaces'
        }
      }
    ]
  };
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'<< Go Back: Interfaces',
        execute:
        {
          type:'url',
          url:'/setupwizard/networkconfig/interfaces'
        }
        
      }
    ]
  
  };
  ngAfterViewInit() {
    setTimeout(() => {
      this.enableNavButtons();
    }, 100);
  }

  enableNavButtons() {

    const buttons = document.querySelectorAll('#navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
}
