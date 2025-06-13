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
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-tailscale-startconfig-page', //Home cloud changes
  template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  styleUrls: ['./tailscale-config-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})


export class TailscaleConfigFormPageComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getTailscaleStatus'
      }
    },
    fields: [

      {
        type: 'paragraph',
        title: gettext('VPN enables you to access Homecloud securely over Internet from any location. Homecloud would be accessible only from your devices that are connected to same VPN service and allowed accounts.')
      },

      {
        type: 'paragraph',
        title: gettext('If VPN Status is Up then no action is required.')
      },

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
      },
      {
        type: 'divider',
        title: gettext('Reconfigure'),
        name:'containerHeader'
      },
      {
        type:'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext('Important: Changing VPN configuration will break existing connections and connected apps would need to be reconfigured.')
          },
    
          {
            type: 'paragraph',
            title: gettext('To setup/reconfigure VPN follow these steps:')
          },
          {
            type: 'paragraph',
            title: gettext('Step 1. Sign-up for Tailscale VPN service on: https://login.tailscale.com/')
          },
    
          {
            type: 'paragraph',
            title: gettext('Step 2. After login to Tailscale follow navigation >> Skip Introduction >> Settings >> On left navigation bar >> OAuth Clients >> Generate OAuth client >> Description. Set Description to Homecloud >> Select All scope for Read and Write >> Scroll down and press Generate client. Copy/Paste generated values to below fields.')
          },
          {
            type: 'paragraph',
            title: gettext('')
          },
          {
            type: 'paragraph',
            title: gettext('Copy/Paste generated values to below fields and press Submit button below.')
          },
          {
            type: 'textInput',
            name: 'clientid',
            label: gettext('Tailscale Client ID'),
            placeholder: gettext('Paste Client ID generated here'),
            textField: 'description',
            valueField: 'Tailscale api client id',
            suggestions:false,
            value: '',
            disabled:'false',
            validators: {
              required: true,
              custom: [
                {
                    constraint: {
                      operator: 'regex',  // Use regex to check for the backtick
                      arg0: { prop: 'clientid' },
                      arg1: '^[^`\'"]*$',  // Regular expression to ensure no backticks
                    },
                    errorData: gettext("Client Id cannot contain the backtick (`), single quote (') or double quote (\") characters.")
                }
    
              ]
            }
          },
    
          {
            type: 'textInput',
            name: 'clientsecret',
            label: gettext('Tailscale Api Client Secret'),
            placeholder: gettext('Paste Client Secret here'),
            textField: 'description',
            valueField: 'Tailscale api client secret',
            suggestions:false,
            value: '',
            disabled:'false',
            validators: {
              required: true,
              custom: [
                {
                    constraint: {
                      operator: 'regex',  // Use regex to check for the backtick
                      arg0: { prop: 'clientsecret' },
                      arg1: '^[^`\'"]*$',  // Regular expression to ensure no backticks
                    },
                    errorData: gettext("Client Secret cannot contain the backtick (`), single quote (') or double quote (\") characters.")
                }
    
              ]
            }
          },
    
          {
            type: 'textInput',
            name: 'tailnetname',
            label: gettext('Tailnet Name'),
            placeholder: gettext('Go to >> DNS tab and paste Tailnet name here.'),
            textField: 'description',
            valueField: 'Tailscale tailnet name',
            suggestions:false,
            value: '',
            disabled:'false',
            validators: {
              required: true,
              custom: [
                {
                    constraint: {
                      operator: 'regex',  // Use regex to check for the backtick
                      arg0: { prop: 'tailnetname' },
                      arg1: '^[^`\'"]*$',  // Regular expression to ensure no backticks
                    },
                    errorData: gettext("Tailnet name cannot contain the backtick (`), single quote (') or double quote (\") characters.")
                }
    
              ]
            }
          },
          {
            type: 'paragraph',
            title: gettext('Press Submit button below.')
          },
          {
            type: 'paragraph',
            title: gettext('Step 3. After successful configuration go to Tailscale admin console: https://login.tailscale.com/admin/machines >> In the list of machines find homecloud >> on the right side press three dots ...  >> Edit route settings >> Enable Use as exit node >> Save')
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
            type: 'paragraph',
            title: gettext('Step 4. Configure Tailscale on your access devices - phone, computer to access Homecloud. For device specific setup instructions go to VPN >> Access page')
          }

        ]
      }

    ],
    buttons: [
      {
        template: 'submit',
        text:'Submit',
        execute: {
            type: 'taskDialog',
            taskDialog: {
              config: {
                title: gettext('Message'),
                autoScroll: false,
                startOnInit: true,
                buttons: {
                  start: {
                    hidden: true
                  },
                  stop: {
                    hidden: true
                  },
                  close:{
                    hidden: false,
                    disabled: false,
                    autofocus: false,
                    dialogResult: true
                  }

                },
                request: {
                  service: 'TailscaleConfig',
                  method: 'generateAccessToken',
                  params:{
                    clientid:'{{ clientid }}',
                    clientsecret:'{{ clientsecret }}',
                    tailnetname:'{{ tailnetname }}'


                  }

                }
              },
            successUrl:'/startconfiguration/vpn'
            }
        }
      }

    ]

  };

  constructor(private rpcService: RpcService){
    super();
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getTailscaleStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldColors(status);     //Update colors based on status
      this.collapseContainerWithSubmitBtn(status);     //collapse/expand container based on status
        
    });
  }
  

  collapseContainerWithSubmitBtn(status:string):void {
    //Logic for collapsible container
    const divider = document.querySelector('omv-tailscale-startconfig-page omv-form-divider');
    const dividerc = document.querySelector('omv-tailscale-startconfig-page .omv-form-divider');
    const container = document.querySelector('omv-tailscale-startconfig-page .omv-form-container');
    const submitButton = document.querySelector('omv-tailscale-startconfig-page .mat-card-actions');
   

    //console.log('divider:',divider);
    //console.log('container:',container);
    //Hide container by default
    if (container && divider) {   
        if (container instanceof HTMLElement && divider instanceof HTMLElement) {
          if(status === 'Up'){
            container.classList.add('hidden');
            divider.classList.remove('hidden');
            submitButton.classList.add('hidden');
            
          }
          else{
            container.classList.remove('hidden');
            divider.classList.add('hidden');
            submitButton.classList.remove('hidden');
          }
          
        }
        if(status === 'Up'){
          divider.addEventListener('click', () => {            
            container.classList.toggle('hidden');
            submitButton.classList.toggle('hidden');
            if(dividerc){
              dividerc.classList.toggle('expanded');
        
            }
          });

        }
    }

    
   
  }   
   


  updateFieldColors(status:string):void{
    const element = document.querySelector('omv-tailscale-startconfig-page omv-form-text-input:nth-of-type(1) .mat-form-field input');
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
