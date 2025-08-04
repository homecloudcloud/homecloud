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
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-setupwizard-password-manager-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
      <div id="password-manager-main-form1">
        <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
      </div>
      <omv-intuition-form-page id="password-manager-main-form2" [config]="this.config2"></omv-intuition-form-page>
      <omv-intuition-form-page id="password-manager-main-form3" [config]="this.config3"></omv-intuition-form-page>
  </div>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./password-manager-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsPasswordManagerMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `
    <div class="content-wrapper">
      <div class="left-column">
        <div class="vault-logo"></div>
        <p class="intro-text">
          Vaultwarden is used for securely storing, managing, and sharing sensitive online data such as passwords, passkeys, and credit, debit cards. Running Vaultwarden on Homecloud allows you to store your sensitive data locally in your complete physical and logical control. Passwords, credit card information can also be shared securely with family members while not exposing data to public cloud. All your data stays on Homecloud device.
        </p>
        <h2>Key Features:</h2>
        <ul>
          <li><strong>Access Your Passwords Anywhere</strong><br>
          Use your passwords across all devices: phone, laptop, tablet, or browser.
          </li>

          <li><strong>Auto-Fill Logins with Browser Extensions</strong><br>
          Instantly fill in usernames and passwords on websites using the Bitwarden extension for Chrome, Firefox, etc.
          </li>

          <li><strong>Your Vault is Fully Private</strong><br>
          Everything is end-to-end encrypted — even the server admin can't see your passwords.You’re hosting it yourself on Homecloud, so you control your data.
          </li>


        </ul>

        <h2>How It Works</h2>
        <p><strong>Vaultwarden has two components:</strong></p>

        <h3>1. Backend (Runs on Homecloud)</h3>
        <ul>
          <li>It stores and encrypts all sensitive data.</li>
        </ul>

        <h3>2. Frontend (Mobile App & Web App)</h3>
        <ul>
          <li>Frontend which is a mobile app, desktop app or web browser extension is used to retrieve sensitive data from backend and use on web pages and apps.</li>
          <li>Bitwarden apps are compatible with Vaultwarden backend service and are used to access Vaultwarden.</li>
        </ul>

        <h2>Deployment Notice</h2>
        <p>
          Vaultwarden is an open-source third-party application. Before deploying, please read more about it here:<br> 
          <a href="https://www.vaultwarden.ca/" class="plainLink" target="_blank">https://www.vaultwarden.ca/</a>
        </p>

        <h2>Getting Started</h2>
        <p>Follow below instructions for deployment.</p>
        <p>After deploying, go to the <a class="plainLink" href="#/setupwizard/apps/password-manager/access">access page</a> to start using the app.</p>
      </div>

      <div class="right-column">
        <img src="/assets/images/bitwarden.png" alt="Vault dashboard image">
      </div>
    </div>

    
`;
  
     
  
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
        type: 'textInput',
        name: 'message',
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
        text:'Deploy Vaultwarden on Homecloud',
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
            successUrl:'/setupwizard/apps/password-manager/access'
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
      }
      /*,
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Vaultwarden'),
        hint: gettext('By checking this box, you agree to remove Vaultwarden app from homecloud'),
        value: false,
        readonly: false
      }
        */
    ],
   /* buttons:[
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
            successUrl:'/setupwizard/apps'
            }
        }
      }
    ]
      */

  };
  constructor(private rpcService: RpcService,private sanitizer: DomSanitizer) {
    super();
     // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);

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
  //  console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-setupwizard-password-manager-main-page #password-manager-main-form2 omv-form-checkbox');
    const checkboxRemove=document.querySelector('omv-setupwizard-password-manager-main-page #password-manager-main-form3 omv-form-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-password-manager-main-page  #password-manager-main-form2 omv-submit-button button');
    
    const photosMainForm2=document.querySelector('omv-setupwizard-password-manager-main-page #password-manager-main-form2');
    const photosMainForm3=document.querySelector('omv-setupwizard-password-manager-main-page #password-manager-main-form3');
   
    if(status === 'Not deployed'){
      
     // console.log('status is not deployed');
      photosMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      this.rpcService.request('Homecloud', 'vaultwarden_get_latest_version').subscribe(response => {
        const version = response.version;
        if (!version || version.trim() === '') {
          // Version is null, undefined, empty, or contains only spaces
          deployButton.classList.add('mat-button-disabled');
          checkboxDeploy.classList.add('hidden');
        }
        else{
           this.checkboxDeployListener();
        }
      });     
     
    }
    else{
    //  console.log('status is deployed');
      photosMainForm2.classList.add('hidden');
      checkboxRemove.classList.remove('hidden');
      this.checkboxRemoveListener();
     
    }
  }

  checkboxDeployListener(){
    const checkboxDeploy=document.querySelector('omv-setupwizard-password-manager-main-page #password-manager-main-form2 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-password-manager-main-page  #password-manager-main-form2 omv-submit-button button');
     checkboxDeploy.addEventListener('click', () => {
            // Add a small delay to ensure class changes are applied
            setTimeout(() => {
                const isChecked = checkboxDeploy.classList.contains('mat-checkbox-checked');
            //   console.log('Checkbox checked status:', isChecked);
                
                if (isChecked) {
                    deployButton.classList.remove('mat-button-disabled');
              //     console.log('Deploy button enabled - classes:', deployButton.className);
                } else {
                    deployButton.classList.add('mat-button-disabled');
            //       console.log('Deploy button disabled - classes:', deployButton.className);
                }
            }, 0);
      });

  }

  checkboxRemoveListener(){
    const removeButton = document.querySelector('omv-setupwizard-password-manager-main-page  #password-manager-main-form3 omv-submit-button button');
    const checkboxRemove=document.querySelector('omv-setupwizard-password-manager-main-page #password-manager-main-form3 omv-form-checkbox mat-checkbox');
    checkboxRemove.addEventListener('click', () => {
        // Add a small delay to ensure class changes are applied
        setTimeout(() => {
            const isChecked = checkboxRemove.classList.contains('mat-checkbox-checked');
            console.log('Checkbox checked status:', isChecked);
            
            if (isChecked) {
                removeButton.classList.remove('mat-button-disabled');
                removeButton.classList.add('red', 'white');
          //      console.log('Remove button enabled - classes:', removeButton.className);
            } else {
                removeButton.classList.add('mat-button-disabled');
                removeButton.classList.remove('red', 'white');
          //      console.log('Remove button disabled - classes:', removeButton.className);
            }
        }, 0);
    });
  }

  
  public navConfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Notes app access',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/notes/access'
        }
        
      },
      
      {template:'submit',
        text:'Next: Password Manager Access  >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkPasswordAppDeployForWizard',
            task:false,
            progressMessage:gettext('Please wait, checking Password Manager app setup ...'),
            successNotification:gettext('Password Manager app setup is complete.'),
            successUrl:'/setupwizard/apps/password-manager/access',
            
          }
        }
      },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip Password Manager Setup',
        /*confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'If VPN is not configured, You will not be able to access Homecloud from outside your local network. Some applications like Password manager will also not work without VPN. Do you still want to skip?<b>Note:</b> You can also configure VPN later from Homecloud Dashboard.'
        },
        */
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'appsPasswordManagerAccess',
            },
            successUrl:'/setupwizard/apps/media',
          }
        }
      }
    
    ]
  };
  

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-password-manager-main-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.enableNavButtons(); // Enable buttons after view initialization
    }, 100);    
  }


}
