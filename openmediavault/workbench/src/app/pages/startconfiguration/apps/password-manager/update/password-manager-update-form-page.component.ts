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
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { FormPageButtonConfig } from '~/app/core/components/intuition/models/form-page-config.type';


@Component({
  selector:'omv-password-manager-update-page', //Home cloud changes
  template: `<div id="password-manager-update-form1">
                <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
              </div>
              <omv-intuition-form-page id="password-manager-update-form2"[config]="this.config"></omv-intuition-form-page>
              <div id="password-manager-update-form3">
                <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
              </div>
             <omv-intuition-form-page id="password-manager-update-form4"[config]="this.config2"></omv-intuition-form-page>`,
  styleUrls: ['./password-manager-update-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})


export class AppsPasswordManagerUpdateFormPageComponent extends BaseFormPageComponent {
  private statustosend:string='';
  private buttonText:string='';
  public safeHtmlContent: SafeHtml;
  public safeHtmlContent1: SafeHtml;
  
  
  private htmlContent= `
            <div class="update-section">
              <h1>🔄 Check for Backend App Updates</h1>
              <p>
              Stay up to date with the latest <strong>community-driven updates</strong> for the app backend running on your Homecloud.
              </p>

              <ul>
              <li>📱 <strong>Mobile app updates</strong> are delivered through your device's App Store or Google Play.</li>
              <li>☁️ <strong>Backend updates</strong> are downloaded directly from app open-source community repositories.</li>
              </ul>

              <p>
              📋 Before updating, please <a href="https://github.com/dani-garcia/vaultwarden" class="plainLink" target="_blank">review the release notes</a> for important information.
              </p>

              <p>
              ⚠️ We recommend taking a <strong>backup</strong> of your app before proceeding with any update.
              </p>
            </div>

  `;
  private htmlContent1= `

            <div class="auto-update-box">
              <h3>⚙️ Enable Auto Updates</h3>
              <p>Automatically keep your app backend up to date with the latest releases.</p>
              <p class="note">Note: Mobile app updates are managed by your phone's app store.</p>
            </div>
            

  `;
  private buttonConfig:FormPageButtonConfig= {
      text: this.buttonText,
      disabled: false,
      submit: true,
      class: 'omv-background-color-pair-primary',
      execute: {
        type: 'request',
        request: {
          service: 'Homecloud',
          method: 'appAutoUpdates',
          params: {
            appname: 'vaultwarden',
            action: this.statustosend
          },
          task: false,
          progressMessage: 'Updating auto-update settings...',
          successNotification: 'Successfully updated auto-update settings',
          successUrl: '/startconfiguration/apps/password-manager/access'
        }
      }
  };


  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'vaultwarden_check_version'
      },
      
    },
    fields: [

      

      {
        type: 'textInput',
        name: 'status',
        label: gettext('New updates for Vaultwarden backend service'),
        hint: gettext(''),
        value: '',
        readonly: true
      },
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Vaultwarden backend service version in-use'),
        value: '',
        readonly: true
      },
      {
        type: 'textInput',
        name: 'available_version',
        label: gettext('Latest version available'),
        hint: gettext('Vaultwarden backend service latest version available'),
        value: '',
        readonly: true
      },
      {
        type: 'checkbox',
        name: 'updateConfirmation',
        label: gettext('Yes,I want to update'),
        hint: gettext('By checking this box, you agree to update the Vaultwarden app to latest version'),
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
                autoScroll: true,
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
                  method: 'vaultwarden_update_version',
                  params:{
                    version:'{{ available_version }}',
                  }

                }
              },
            successUrl:'/startconfiguration/apps/password-manager/access'
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
          appname: 'vaultwarden',
          action: 'status'
        }
      },
    },
    fields: [
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Auto updates for Vaultwarden backend'),
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
    //Sanitize html
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    this.safeHtmlContent1 = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent1);
   
  }

  


  ngOnInit():void{
    this.rpcService.request('Homecloud', 'appAutoUpdates',{
      appname: 'vaultwarden',
      action: 'status'
    }).subscribe(response => {
      this.statustosend = response.status === 'enabled' ? 'disable' : 'enable';
      this.buttonText = response.status === 'enabled' ? 'Disable Auto updates for Vaultwarden backend' : 'Enable Auto updates for Vaultwarden backend';
      // Set the button config after we have the status
      this.buttonConfig.execute.request.params.action = this.statustosend;
      this.buttonConfig.text = this.buttonText;
      this.config2.buttons = [this.buttonConfig];
    });
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'vaultwarden_check_version').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldColors(status);     //Update colors based on status
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }
 
  updateFieldColors(status:string):void{
    const element = document.querySelector('omv-password-manager-update-page omv-form-text-input:nth-of-type(1) .mat-form-field input');
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
    const checkbox=document.querySelector('omv-password-manager-update-page omv-form-checkbox');
    const updateButton = document.querySelector('omv-password-manager-update-page omv-submit-button button');
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
