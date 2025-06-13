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
import * as _ from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-password-manager-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="password-manager-main-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="password-manager-main-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="password-manager-main-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./password-manager-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsPasswordManagerMainComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getVaultwardenServiceStatus'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('Homecloud supports opensource password manager named Vaultwarden.')
      },
      {
        type: 'paragraph',
        title: gettext('Vaultwarden is used for securely storing, managing, and sharing sensitive online data such as passwords, passkeys, and credit, debit cards. Running Vaultwarden on Homecloud allows you to store your sensitive data locally in your complete physical and logical control.')
      },
      {
        type: 'paragraph',
        title: gettext('Passwords, credit card information can also be shared securely with family members while not exposing data to public cloud. All your data stays on Homecloud device.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('Vaultwarden has two components: 1. Backend service that runs on Homecloud. It stores and encrypts all sensitive data.')
      },
      {
        type: 'paragraph',
        title: gettext('2.Frontend which is a mobile app, desktop app or web browser extension is used to retrieve sensitive data from backend and use on web pages and apps.')
      },
      {
        type: 'paragraph',
        title: gettext('Bitwarden apps are compatible with Vaultwarden backend service and are used to access Vaultwarden.')
      },
      {
        type: 'paragraph',
        title: gettext(` This is an open source 3rd party software. By clicking deploy you agree to terms and conditions enter link here. To learn more about Vaultwarden visit open source project at:&nbsp;&nbsp; <a class="plainLink" href="https://github.com/dani-garcia/vaultwarden" target="_blank">Learn more about Vaultwarden </a> `)
      }
    ]
  };

  public config2: FormPageConfig = {
      request: {
        service: 'Homecloud',
        get: {
          method: 'vaultwarden_get_latest_version'
        }
      },
      fields: [
      {
        type: 'textInput',
        name: 'version',
        label: gettext('Latest Vaultwarden version available to deploy'),
        hint: gettext('This version will be deployed'),
        value: '',
        readonly: true
      },
      {
        type: 'checkbox',
        name: 'deployConfirmation',
        label: gettext('Yes,I want to Deploy Vaultwarden'),
        hint: gettext('By checking this box, you agree to install opensource vaultwarden app directly from project repository'),
        value: false,
        readonly: false
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Deploy Immich on Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'Please review project license documentation before proceeding. Do you want to continue?'
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
                    version:'{{ version}}',
                  }

                }
              },
            successUrl:'/startconfiguration/apps/password-manager/access'
            }
        }
      }
      
      

    ]
  };

  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'vaultwarden_check_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Vaultwarden backend service version in-use'),
        value: '',
        readonly: true
      },
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Vaultwarden'),
        hint: gettext('By checking this box, you agree to remove Vaultwarden app from homecloud'),
        value: false,
        readonly: false
      }
    ],
    buttons:[
      {
        template: 'submit',
        text:'Remove Vaultwarden from Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'This will remove Vaultwarden application and configuration. Your data will not be deleted. Do you want to continue?'
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
                  method: 'vaultwarden_remove'

                }
              },
            successUrl:'/startconfiguration/apps'
            }
        }
      }
    ]

  };
  constructor(private rpcService: RpcService,private sanitizer: DomSanitizer) {
    super();
    // Sanitize the title 
    this.config.fields[7].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[7].title) as unknown as string;


  }

  ngAfterViewInit(): void {
        
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {
      
      // Select all paragraph elements 
      const paragraphs = document.querySelectorAll('#password-manager-main-form1 .omv-form-paragraph');
      


      paragraphs[7].innerHTML =
      (this.config.fields[7].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[7].title?.toString();
      
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
    
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getVaultwardenServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }

  updateFieldVisibility(status:string):void{
    console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-password-manager-main-page #password-manager-main-form2 omv-form-checkbox mat-checkbox');
    const checkboxRemove=document.querySelector('omv-password-manager-main-page #password-manager-main-form3 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-password-manager-main-page  #password-manager-main-form2 omv-submit-button button');
    const removeButton = document.querySelector('omv-password-manager-main-page  #password-manager-main-form3 omv-submit-button button');
    const passwordManagerMainForm2=document.querySelector('omv-password-manager-main-page #password-manager-main-form2');
    const passwordManagerMainForm3=document.querySelector('omv-password-manager-main-page #password-manager-main-form3');
   
    if(status === 'Not deployed'){
      console.log('status is not deployed');
      passwordManagerMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      checkboxDeploy.addEventListener('click', () => {
        // Add a small delay to ensure class changes are applied
        setTimeout(() => {
            const isChecked = checkboxDeploy.classList.contains('mat-checkbox-checked');
            console.log('Checkbox checked status:', isChecked);            
            if (isChecked) {
                deployButton.classList.remove('mat-button-disabled');
                console.log('Deploy button enabled - classes:', deployButton.className);
            } else {
                deployButton.classList.add('mat-button-disabled');
                console.log('Deploy button disabled - classes:', deployButton.className);
            }
        }, 0);
    });
     
    }else{
      console.log('status is deployed');
      passwordManagerMainForm2.classList.add('hidden');
      checkboxRemove.classList.remove('hidden');
      checkboxRemove.addEventListener('click', () => {
        // Add a small delay to ensure class changes are applied
        setTimeout(() => {
            const isChecked = checkboxRemove.classList.contains('mat-checkbox-checked');
            console.log('Checkbox checked status:', isChecked);
            
            if (isChecked) {
                removeButton.classList.remove('mat-button-disabled');
                removeButton.classList.add('red', 'white');
                console.log('Remove button enabled - classes:', removeButton.className);
            } else {
                removeButton.classList.add('mat-button-disabled');
                removeButton.classList.remove('red', 'white');
                console.log('Remove button disabled - classes:', removeButton.className);
            }
        }, 0);
    });
     
    }
  }

}
