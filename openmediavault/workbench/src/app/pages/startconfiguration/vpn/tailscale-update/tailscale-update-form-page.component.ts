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
import { DomSanitizer } from '@angular/platform-browser';
import { FormPageButtonConfig } from '~/app/core/components/intuition/models/form-page-config.type';


@Component({
  selector:'omv-tailscale-update-page', //Home cloud changes
  template: `<omv-intuition-form-page id="tailscale-update-form"[config]="this.config"></omv-intuition-form-page>
             <omv-intuition-form-page id="tailscale-update-form"[config]="this.config2"></omv-intuition-form-page>`,
  styleUrls: ['./tailscale-update-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})


export class TailscaleUpdateFormPageComponent extends BaseFormPageComponent {
  private statustosend:string='';
  private buttonConfig:FormPageButtonConfig= {
      text: 'Enable/Disable Auto updates for Tailscale VPN client',
      disabled: false,
      submit: true,
      class: 'omv-background-color-pair-primary',
      execute: {
        type: 'request',
        request: {
          service: 'Homecloud',
          method: 'appAutoUpdates',
          params: {
            appname: 'tailscale',
            action: this.statustosend
          },
          task: false,
          progressMessage: 'Updating auto-update settings...',
          successNotification: 'Successfully updated auto-update settings',
          successUrl: '/startconfiguration/vpn'
        }
      }
  };


  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'tailscale_check_version'
      },
      
    },
    fields: [

      {
        type: 'paragraph',
        title: gettext('Tailscale releases updates for VPN client on Homecloud, Compuaters and phones. Phone updates are pushed via app store or playstore. Computer app need to be manually updated')
      },

      {
        type: 'paragraph',
        title: gettext('Software updates are directly downloaded from Tailscale repositories and are not tested by Homecloud product team.')
      },

      {
        type: 'paragraph',
        title: gettext('Review release information before proceeding with update. Details available at:&nbsp;&nbsp;<a class="plainLink" href="https://tailscale.com/kb/1168/versions" target="_blank">Review release informaton</a> ')
      },

      {
        type: 'paragraph',
        title: gettext('')
      },

      {
        type: 'textInput',
        name: 'status',
        label: gettext('New updates for Tailscale VPN'),
        hint: gettext(''),
        value: '',
        readonly: true
      },
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed version'),
        hint: gettext('Tailscale VPN version in-use'),
        value: '',
        readonly: true
      },
      {
        type: 'textInput',
        name: 'available_version',
        label: gettext('Latest version available'),
        hint: gettext('Tailscale VPN version'),
        value: '',
        readonly: true
      },
      {
        type: 'checkbox',
        name: 'updateConfirmation',
        label: gettext('Yes,I want to update'),
        hint: gettext('By checking this box, you agree to update Tailscale to latest version'),
        value: '',
        readonly: false
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Update to Latest Version',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'Please review the release documentation before updating. Do you want to continue?'
          )
        },
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
                  service: 'Homecloud',
                  method: 'tailscale_update_version',
                  params:{
                    version:'{{ available_version }}',
                  }

                }
              },
            successUrl:'/startconfiguration/vpn'
            }
        }
      }

    ]

  };

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'appAutoUpdates',
        params: {
          appname: 'tailscale',
          action: 'status'
        }
      },
    },
    fields: [
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Auto updates for Tailscale VPN'),
        hint: gettext(''),
        value: '',
        readonly: true
      }
    ],
    buttons: [
    
    ]
  };
  

  constructor(private rpcService: RpcService, private sanitizer: DomSanitizer){
    super();
    
    this.config.fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].title) as unknown as string;
  }

  ngAfterViewInit(): void {
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {
      

      // Select all paragraph elements (assuming they are rendered as `photos-update-form omv-form-paragraph` elements)
        const paragraphs = document.querySelectorAll('#tailscale-update-form .omv-form-paragraph');

        // Inject the sanitized HTML into the correct paragraph element
        paragraphs[2].innerHTML =
        (this.config.fields[2].title as any).changingThisBreaksApplicationSecurity ||
        this.config.fields[2].title?.toString();

               
    }, 100); // Timeout ensures it happens after the view has rendered
  }


  ngOnInit():void{
    this.rpcService.request('Homecloud', 'appAutoUpdates',{
      appname: 'tailscale',
      action: 'status'
    }).subscribe(response => {
      this.statustosend = response.status === 'enabled' ? 'disable' : 'enable';
      // Set the button config after we have the status
      this.buttonConfig.execute.request.params.action = this.statustosend;
      this.config2.buttons = [this.buttonConfig];
    });
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'tailscale_check_version').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldColors(status);     //Update colors based on status
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }
 
  updateFieldColors(status:string):void{
    const element = document.querySelector('omv-tailscale-update-page omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element){
      if(status === 'Update-Available' || status === 'Error'){
        element.classList.add('redUpdateStatus');
        element.classList.remove('greenUpdateStatus');
      }else{
        element.classList.remove('redUpdateStatus');
        element.classList.add('greenUpdateStatus');
      }
    }
  }

  updateFieldVisibility(status:string):void{
    const checkbox=document.querySelector('omv-tailscale-update-page omv-form-checkbox mat-checkbox');
    const updateButton = document.querySelector('omv-tailscale-update-page omv-submit-button button');
    if(status !== 'Update-Available'){
      checkbox.classList.add('hidden');
      updateButton.classList.add('mat-button-disabled');
    }else{
      checkbox.classList.remove('hidden');
      checkbox.addEventListener('click', () => {
      //updateButton.classList.toggle('mat-button-disabled');
      checkbox.addEventListener('click', () => {
        // Add a small delay to ensure class changes are applied
        setTimeout(() => {
            const isChecked = checkbox.classList.contains('mat-checkbox-checked');
            console.log('Checkbox checked status:', isChecked);
            
            if (isChecked) {
                updateButton.classList.remove('mat-button-disabled');
                console.log('Update button enabled - classes:', updateButton.className);
            } else {
                updateButton.classList.add('mat-button-disabled');
                console.log('Update button disabled - classes:', updateButton.className);
            }
        }, 0);
    });
      });
    }

  }
}
