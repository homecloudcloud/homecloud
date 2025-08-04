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
  selector:'omv-setupwizard-joplin-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
      <div id="joplin-main-form1">
        <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
      </div>
      <omv-intuition-form-page id="joplin-main-form2" [config]="this.config2"></omv-intuition-form-page>
      <omv-intuition-form-page id="joplin-main-form3" [config]="this.config3"></omv-intuition-form-page>
  </div>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  
  `,
  styleUrls: ['./joplin-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsJoplinMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `
    <div class="content-wrapper">
      <div class="left-column">
        <div class="joplin-logo"></div>
        <p class="intro-text">
          Joplin is a free, open source note taking and to-do application, which can handle a large number of notes organised into notebooks. The notes are searchable, can be encrypted, copied, tagged and modified either from the applications directly or from your own text editor.
        </p>
        <h2>Key Features:</h2>
        <ul>
          <li><strong>Text search</strong><br>
            Full text search is available on all platforms to quickly find the information you need. 
          </li>

          <li><strong>Offline First:</strong><br>
            Joplin is "offline first", which means you always have all your data on your phone or computer. This ensures that your notes are always accessible, whether you have an internet connection or not.
          </li>

          <li><strong>Secure sync</strong><br>
            The notes can be securely synchronised using end-to-end encryption with Homecloud.
          </li>

        </ul>

        <h2>How It Works</h2>
        <p><strong>Joplin has two components:</strong></p>

        <h3>1. Backend (Runs on Homecloud)</h3>
        <ul>
          <li>It stores all your notes on Homecloud privately. No data is stored on any public cloud</li>
        </ul>

        <h3>2. Frontend (Mobile App & Web App)</h3>
        <ul>
          <li>Users can take notes, import/export notes and share among users.</li>
          <li>The application is available for Windows, Linux, macOS, Android and iOS.</li>
          <li>A Web Clipper, to save web pages and screenshots from your browser, is also available for Firefox and Chrome.</li>
          <li>Share specific notes securely with family or friends — they can create their own accounts on your Joplin instance. They would need to access your Tailscale VPN to connect to Homecloud.</li>
        </ul>

        <h2>Deployment Notice</h2>
        <p>
          Joplin is an open-source third-party application. Before deploying, please read more about it here:<br> 
          <a href="https://joplinapp.org/" class="plainLink" target="_blank">https://joplinapp.org/</a>
        </p>

        <h2>Getting Started</h2>
        <p>Follow below instructions for deployment.</p>
        <p>After deploying, go to the <a class="plainLink" href="#/setupwizard/apps/notes/access">access page</a> to start using the app.</p>
      </div>

      <div class="right-column">
        <img src="/assets/images/Joplin_image.webp" alt="Joplin dashboard image">
      </div>
    </div>

    
`;
  

  public config2: FormPageConfig = {
      request: {
        service: 'Homecloud',
        get: {
          method: 'joplin_get_latest_version'
        }
      },
      fields: [
      {
        type: 'textInput',
        name: 'version',
        label: gettext('Latest Joplin version available to deploy'),
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
        label: gettext('Yes,I want to Deploy Joplin'),
        hint: gettext('By checking this box, you agree to install opensource Joplin app directly from project repository. If first time deployment (or done app reset) then use the username: admin@locahost, password: admin. Make sure to change password after login and update email-id in profile. There is no way to reset admin password without an email id. Also make sure Email is setup in Notifications page. '),
        value: false,
        readonly: false
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Deploy Joplin on Homecloud',
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
                  method: 'joplin_update_version',
                  params:{
                    version:'{{ version}}'
                  }
                }
              },
            successUrl:'/setupwizard/apps/notes/access'
            }
        }
      }
      
      

    ]
  };

  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'joplin_check_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Joplin backend service version in-use'),
        value: '',
        readonly: true
      }
      /*,
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Joplin'),
        hint: gettext('By checking this box, you agree to remove Joplin app from Homecloud'),
        value: false,
        readonly: false
      }
        */
    ],
   /* buttons:[
      {
        template: 'submit',
        text:'Remove Joplin from Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'This will remove Joplin application and configuration. Your data will not be deleted. Do you want to continue?'
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
                  method: 'joplin_remove'

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
    this.rpcService.request('Homecloud', 'getJoplinServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }

  updateFieldVisibility(status:string):void{
  //  console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-setupwizard-joplin-main-page #joplin-main-form2 omv-form-checkbox');
    const checkboxRemove=document.querySelector('omv-setupwizard-joplin-main-page #joplin-main-form3 omv-form-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-joplin-main-page  #joplin-main-form2 omv-submit-button button');
    
    const photosMainForm2=document.querySelector('omv-setupwizard-joplin-main-page #joplin-main-form2');
    const photosMainForm3=document.querySelector('omv-setupwizard-joplin-main-page #joplin-main-form3');
   
    if(status === 'Not deployed'){
      
     // console.log('status is not deployed');
      photosMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      this.rpcService.request('Homecloud', 'joplin_get_latest_version').subscribe(response => {
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
    const checkboxDeploy=document.querySelector('omv-setupwizard-joplin-main-page #joplin-main-form2 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-joplin-main-page  #joplin-main-form2 omv-submit-button button');
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
    const removeButton = document.querySelector('omv-setupwizard-joplin-main-page  #joplin-main-form3 omv-submit-button button');
    const checkboxRemove=document.querySelector('omv-setupwizard-joplin-main-page #joplin-main-form3 omv-form-checkbox mat-checkbox');
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
        text:'< Prev: Docs app access',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/paperless/access'
        }
        
      },
      
      {template:'submit',
        text:'Next: Password manager app Setup >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkNotesAppDeployForWizard',
            task:false,
            progressMessage:gettext('Please wait, checking Notes app setup ...'),
            successUrl:'/setupwizard/apps/password-manager',
            
          }
        }
      },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip Notes app Setup',
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
              'lastCompletedStepName':'appsNotesAccess'
            },
            successUrl:'/setupwizard/apps/password-manager',
          }
        }
      }
    
    ]
  };
  

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-joplin-main-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
  ngAfterViewInit() { 
    // Use setTimeout to ensure the DOM is fully loaded before enabling buttons
    setTimeout(() => {
      this.enableNavButtons();
    }, 100);
  }

}
