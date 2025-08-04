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

import { FormPageConfig} from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
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

      omv-setupwizard-interface-wifi-form-page{

        #mainContainer{
          //  scrollbar-color:$lightblue transparent;
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
    omv-setupwizard-interface-wifi-form-page{

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
  selector:'omv-setupwizard-interface-wifi-form-page'  //Home cloud changes
})
export class InterfaceWifiFormPageComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
      request: {
        service: 'Homecloud',
        get: {
          method: 'getWirelessIface',
          params: {
            uuid: '{{ _routeParams.uuid }}'
          }
        }
        ,
        post: {
          method: 'setWirelessIface',
          confirmationDialogConfig:{
            template: 'confirmation',
            message: gettext(`<div style="border: 1px solid #F5C2C7; background-color: #F8D7DA; padding: 1em; border-radius: 8px; color: #842029;">
            <strong>Note:</strong> If you're currently connected via Wi-Fi or Hotspot mode, your session may disconnect after this step.
            Homecloud will switch to the new Wi-Fi settings you entered.
            <br><br>
            Make sure to reconnect your phone or computer to the same Wi-Fi network you've selected.
            Check the Homecloud display for connection status.
            </div>`),
            title:''
          }
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
          value: 'wifi',
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
                  '{{ "enumerateDevices" if _routeConfig.data.editing else "getWirelessCandidates" }}'
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
        /*{
          type: 'textInput',
          name: 'wpassid',
          label: gettext('SSID'),
          value: '',
          validators: {
            required: true
          }
        },*/
        {
          type: 'textInput',
          name: 'wpassid',
          label: gettext('SSID'),
          placeholder: gettext('Select a SSID or Enter your own'),
          textField: 'description',
          valueField: 'wpassid',
          suggestions:true,
          store: {
            proxy: {
              service: 'Network',
              get: {
                method:
                  '{{ "getWifiNames" }}'
              }
            },
           sorters: [
              {
                dir: 'asc',
                prop: 'wpassid'
              }
            ]
          },
          value: '',
          disabled:'false',
          validators: {
            required: true
          }
        },
  
        {
          type: 'select',
          name: 'keymanagement',
          label: gettext('Security'),
          value: 'psk',
          store: {
            data: [
              ['psk', gettext('WPA2-Personal')],
              ['sae', gettext('WPA3-Personal')]
            ]
          },
          validators: {
            required: true
          }
        },
        {
          type: 'passwordInput',
          name: 'wpapsk',
          label: gettext('Password'),
          value: '',
          autocomplete: 'new-password',
          validators: {
            required: true
          }
        },
        {
          type: 'checkbox',
          name: 'hidden',
          label: gettext('Connect to hidden network'),
          hint: gettext('Connect even if the network is not broadcasting its SSID name.'),
          value: false
        },
        {
          type: 'tagInput',
          name: 'comment',
          label: gettext('Tags'),
          value: 'Wi-Fi',
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
          value: 'dhcp',
          store: {
            data: [
  
              ['dhcp', gettext('DHCP')],
              ['manual', gettext('Disabled')],
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
        {
          type: 'divider',
          title: gettext('IPv6')
        },
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
          }
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
              type: 'disabled',
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
              type: 'disabled',
              constraint: { operator: 'ne', arg0: { prop: 'method6' }, arg1: 'static' }
            }
          ]
        },
        {
          type: 'container',
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
                  type: 'disabled',
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
                  type: 'disabled',
                  constraint: { operator: 'ne', arg0: { prop: 'method6' }, arg1: 'static' }
                }
              ]
            }
          ]
        },
        {
          type: 'divider',
          title: gettext('Advanced settings')
        },
        {
          type: 'textInput',
          name: 'altmacaddress',
          label: gettext('MAC address'),
          hint: gettext('Force a specific MAC address on this interface.'),
          value: '',
          validators: {
            patternType: 'macAddress'
          }
        },
        {
          type: 'textInput',
          name: 'dnsnameservers',
          label: gettext('DNS servers'),
          hint: gettext('IP addresses of domain name servers used to resolve host names.'),
          value: '',
          validators: {
            patternType: 'ipList'
          }
        },
        {
          type: 'textInput',
          name: 'dnssearch',
          label: gettext('Search domains'),
          hint: gettext('Domains used when resolving host names.'),
          value: '',
          validators: {
            patternType: 'domainNameList'
          }
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
          }
        },
        {
          type: 'checkbox',
          name: 'wol',
          label: gettext('Wake-on-LAN'),
          value: false
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
          // type: 'click',
          // click: this.clearValues.bind(this)
          }
        }
      ]
    };
  
  
    clearValues(){
      // Manually clear or reset the fields in the config
      console.log('clearing values');
      // Reset reactive form controls to empty
     this.page.setFormValues(
      {devicename:'',wpassid:'',keymanagement:'',wpapsk:'',hidden:false,comment:'',address:'',netmask:'',gateway:'',address6:'',gateway6:'',altmacaddress:'',dnsnameservers:'',dnssearch:'',mtu:0,wol:false}
    );
    
    
   }

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
