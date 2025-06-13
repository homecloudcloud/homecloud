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
//import { ViewChild, ElementRef } from '@angular/core';

@Component({
  template: `<omv-logo-header></omv-logo-header>
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons">
             </omv-intuition-form-page>`,
  selector:'omv-date-time-form-page',  //Home cloud changes
  styles: [`
    @import '../../../../assets/colors.scss';
    omv-date-time-form-page{

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
            margin-top:20vh!important;

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
})
export class DateTimeFormPageComponent extends BaseFormPageComponent {

  
  //@ViewChild('navButton') navButton!: ElementRef;
 

  public config: FormPageConfig = {
    request: {
      service: 'System',
      get: {
        method: 'getTimeSettings'
      },
      post: {
        method: 'setTimeSettings'
      }
    },
    fields: [
      {
        type: 'select',
        name: 'timezone',
        label: gettext('Time zone'),
        store: {
          proxy: {
            service: 'System',
            get: {
              method: 'getTimeZoneList'
            }
          }
        },
        textField: 'value',
        value: 'UTC'
      },
      {
        type: 'checkbox',
        name: 'ntpenable',
        label: gettext('Use NTP server'),
        value: false
      },
      {
        type: 'textInput',
        name: 'ntptimeservers',
        label: gettext('Time servers'),
        value: 'pool.ntp.org',
        modifiers: [
          {
            type: 'enabled',
            constraint: { operator: 'truthy', arg0: { prop: 'ntpenable' } }
          }
        ],
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'ntpenable' } },
          patternType: 'domainNameIpList'
        }
      },
      {
        type: 'textInput',
        name: 'ntpclients',
        label: gettext('Allowed clients'),
        hint: gettext(
          'IP addresses in CIDR notation or host names of clients that are allowed to access the NTP server.'
        ),
        value: '',
        modifiers: [
          {
            type: 'disabled',
            constraint: { operator: 'falsy', arg0: { prop: 'ntpenable' } }
          }
        ],
        validators: {
          patternType: 'hostNameIpNetCidrList'
        }
      }
    ],
    buttons: [
      {
        template: 'submit'
      },
      {
        template: 'cancel',
        execute: {
          type: 'url',
          url: '/setupwizard/datetime'
        }
      }
    ]
  };

  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: VPN Set Up',
        disabled:false,
        execute:
        {
          type:'url',
          url:'/setupwizard/vpn/tailscaleconfig'
        }
        
      },
      {template:'submit',
        text:'Next: Notification Set Up >',
        disabled:false,
        /*execute: {
          type: 'url',
          url: '/setupwizard/notificationsettings'
        }*/
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'datetime'
            },
            successUrl:'/setupwizard/notificationsettings',
          }
        }
      }
    ]

  };
  ngAfterViewInit() {
    setTimeout(() => {
      const buttons = document.querySelectorAll('#navButtons omv-submit-button button');
       // Loop through all buttons and remove disabled class
       buttons.forEach(button => {
        if (button.classList.contains('mat-button-disabled')) {
          button.classList.remove('mat-button-disabled');
          button.removeAttribute('disabled');
        }
      });
    }, 100);
  }

  

}
