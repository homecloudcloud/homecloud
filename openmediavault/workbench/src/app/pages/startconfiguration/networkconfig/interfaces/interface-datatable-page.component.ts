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
import { ViewEncapsulation } from '@angular/core';
//import { template } from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';

@Component({
  template:`
  <omv-intuition-form-page id="interface-main-form1" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-datatable-page #page [config]="this.config"></omv-intuition-datatable-page>
  `,
  styleUrls: ['./interface-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

})
export class InterfaceDatatablePageComponent extends BaseFormPageComponent {

  public config2: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('Wired Network should automatically get configured once you plug-in network cable connected to Router.')
      },
      {
        type: 'paragraph',
        title: gettext('To connect to Wi-Fi network press the create button, select your Wi-Fi SSID and enter password.')
      },
      {
        type: 'paragraph',
        title: gettext('To reset Wi-Fi configuration either use delete button below and re-create or start Hotspot mode by pressing Homecloud power button (located on device) 5 times.')
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
        name: gettext('Type'),
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
      
      {
        name: gettext('Address'),
        prop: 'address',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'template',
        cellTemplateConfig:
          'IPv4: {{ address | default("-", true) }}<br>IPv6: {{ address6 | default("-", true) }}'
      },
    
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
        service: 'Homecloud',
        get: {
          //method: 'getInterfaceList'
          method: 'enumerateConfiguredDevicesWithStatus'
        }
      }
    },
    actions: [
      
      {
        type: 'menu',
        icon: 'add',
        tooltip: gettext('Create'),
        actions: [
          /*
          {
            text: gettext('Ethernet'),
            icon: 'mdi:ethernet',
            execute: {
              type: 'url',
              url: '/startconfiguration/networkconfig/interfaces/ethernet/create'
            }
          },
          */
          {
            text: gettext('Wi-Fi'),
            icon: 'mdi:wifi',
            execute: {
              type: 'url',
              url: '/startconfiguration/networkconfig/interfaces/wifi/create'
            }
          }
          /*
          ,
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
          */
        ]
      },
  
      {
        template: 'edit',
        execute: {
          type: 'url',
          url: '/startconfiguration/networkconfig/interfaces/{{ _selected[0].type }}/edit/{{ _selected[0].uuid }}'
          //url: '/start-configuration/networkconfig/interfaces/{{ _selected[0].type }}/edit/{{ _selected[0].uuid }}'
        }
      },
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
          url: '/startconfiguration/networkconfig/interfaces/details/{{ _selected[0].devicename }}'
        }
      }
      
      ,
      /*
      {
        template: 'delete',
        execute: {
          type: 'request',
          request: {
            service: 'Network',
            method: 'deleteInterface',
            params: {
              uuid: '{{ uuid }}'
            }
          }
        }
      }
      */

      {
        template: 'delete',
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1,
          constraint: [
            {
            operator: 'eq',
            arg0: { prop: 'comment' },
            arg1: 'Wi-Fi'
            }
          ]
        },
        execute: {
          type: 'request',
          request: {
            service: 'Network',
            method: 'deleteInterface',
            params: {
              uuid: '{{ uuid }}'
            }
          }
        }
      }
      
    ],

    buttons:[
      {template:'submit',
        text:'Next: Tailscale configuration',
        url:'/startconfiguration/tailscaleconfig'
      }

    ]
  };
}
