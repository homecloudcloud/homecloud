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
import { ViewEncapsulation } from '@angular/core';

@Component({
  template: `<omv-logo-header></omv-logo-header>
  <div id="mainContainer">
    <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
  </div>
  <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>
  `,
  styles: [`
    @import '../../../../../assets/colors.scss';
    .omv-dark-theme{

      omv-setupwizard-interface-details-form-page{

          #mainContainer{
        //    scrollbar-color:$lightblue transparent;
            h1,h2,h3{color:$lightblue !important;}
            p,li{color:#ffffff !important;}
            .plainLink:hover,.plainLink:focus{
            background-color:$lightblue;
           
            }
          }
       
          
          #navButtons{
              .mat-card{
                    background-color:$lightblue!important;
              }
              .mat-card-actions{
                    button{
                      border:1px solid #ffffff!important;
                    
                    }
                    button:hover,button:focus{
                      background-color:#ffffff!important;
                      color:$lightblue!important;
                    }
              }
          }
           
          

      }
  }
    omv-setupwizard-interface-details-form-page{

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
      #mainContainer{
              margin-top:20vh;
              overflow-y:auto;
              height:70vh;     
              scrollbar-color:$lightblue transparent;
              --scrollbar-border-radius: 0 !important;
              --scrollbar-thumb-color:red !important;
              --scrollbar-thumb-hover-color: var(--scrollbar-thumb-color) !important;

                
                .omv-form-paragraph,h2,p,li,h3 {
                  font-size: var(--mat-font-size-subheading-2) !important;
                
                }
                .omv-form-paragraph,p,li {
                  font-size: var(--mat-font-size-subheading-2) !important;
                  font-weight:var(--mat-font-weight-subheading-2) !important;
                }
              
                
                h2,h1,h3 {
                  color:$blue !important;
                }

                h1{
                  font-size: var(--mat-font-size-headline) !important;
                
                }

                
                
                
              a.plainLink{
                  font-weight:bold;
                }
                
              a.plainLink:hover,a.plainLink:focus{
                  background-color:$lightblue;
                  color:white;
                  padding:10px;
                  text-decoration: none;
                  font-weight:bold;
                }
  
  }
  #navButtons{
            position:fixed;
            width:100%;
            bottom:0;
          
            .mat-card{
                background-color:$blue!important;
            }
            mat-card-content{
                display:none!important;
            }
            .mat-card-actions{
                justify-content:space-between!important;
                flex-direction:row-reverse!important;
                button{
                  border:1px solid #ffffff!important;
                
                }
                button:hover,button:focus{
                  background-color:#ffffff!important;
                  color:$lightblue!important;
                }
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
selector:'omv-setupwizard-interface-details-form-page'  //Home cloud changes
})


export class InterfaceDetailsFormPageComponent {
  public config: FormPageConfig = {
      request: {
        service: 'Network',
        get: {
          method: 'getInformation',
          params: {
            devicename: '{{ _routeParams.devicename }}'
          },
          transform: {
            prefix: '{{ prefix | replace("-1", "") }}',
            prefix6: '{{ prefix6 | replace("-1", "") }}'
          }
        }
      },
      fields: [
        {
          type: 'select',
          name: 'type',
          label: gettext('Type'),
          disabled: true,
          submitValue: false,
          value: 'bond',
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
          type: 'textInput',
          name: 'devicename',
          label: gettext('Device'),
          disabled: true
        },
        {
          type: 'textInput',
          name: 'ether',
          label: gettext('Hardware Address'),
          disabled: true,
          hasCopyToClipboardButton: true
        },
        {
          type: 'textInput',
          name: 'mtu',
          label: gettext('MTU'),
          disabled: true
        },
        {
          type: 'textInput',
          name: 'state',
          label: gettext('State'),
          disabled: true
        },
        {
          type: 'divider',
          title: gettext('IPv4')
        },
        {
          type: 'textInput',
          name: 'address',
          label: gettext('Address'),
          disabled: true,
          hasCopyToClipboardButton: true
        },
        {
          type: 'textInput',
          name: 'prefix',
          label: gettext('Prefix length'),
          disabled: true
        },
        {
          type: 'textInput',
          name: 'netmask',
          label: gettext('Prefix address'),
          disabled: true
        },
        {
          type: 'textInput',
          name: 'gateway',
          label: gettext('Gateway'),
          disabled: true,
          hasCopyToClipboardButton: true
        },
        {
          type: 'divider',
          title: gettext('IPv6')
        },
        {
          type: 'textInput',
          name: 'address6',
          label: gettext('Address'),
          disabled: true,
          hasCopyToClipboardButton: true
        },
        {
          type: 'textInput',
          name: 'prefix6',
          label: gettext('Prefix length'),
          disabled: true
        },
        {
          type: 'textInput',
          name: 'netmask6',
          label: gettext('Prefix address'),
          disabled: true
        },
        {
          type: 'textInput',
          name: 'gateway6',
          label: gettext('Gateway'),
          disabled: true,
          hasCopyToClipboardButton: true
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
