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
  selector:'omv-setupwizard-paperless-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
      <div id="paperless-main-form1">
        <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
      </div>
      
      <omv-intuition-form-page id="paperless-main-form2" [config]="this.config2"></omv-intuition-form-page>
      <omv-intuition-form-page id="paperless-main-form3" [config]="this.config3"></omv-intuition-form-page>
  </div>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./paperless-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsPaperlessMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `
  <div class="content-wrapper">
  <div class="left-column">
    <div class="paperless-logo"></div>
    <p class="intro-text">
      Paperless-ngx is a community-supported open-source document management system that transforms your physical documents into a searchable online archive, allowing you to keep less paper.
    </p>
    <h2>Key Features:</h2>
    <ul>
      <li><strong>Organize & Index Your Documents:</strong><br>
        Tag and categorize your scanned documents with smart metadata — including tags, correspondents, document types, and more.
      </li>

      <li><strong>Privacy First:</strong><br>
        All data is stored <strong>locally</strong> on your Homecloud. Your documents are <strong>never transmitted or shared</strong> outside your personal network.
      </li>

      <li><strong>AI-Powered Automation:</strong><br>
        Automatically detects and assigns tags, correspondents, and document types using built-in machine learning.
      </li>

      <li><strong>Email Processing:</strong><br>
        Automatically import documents from your email accounts.<br>
        - Configure multiple accounts with custom rules for each.<br>
        - Automatically perform actions on messages after processing (e.g., mark as read, delete, and more).
      </li>

      <li><strong>Wide Format Support:</strong><br>
        Supports PDFs, images (JPEG, PNG), plain text files, and Office documents (Word, Excel, PowerPoint, LibreOffice, etc.).
      </li>
    </ul>

    <h2>How It Works</h2>
    <p><strong>Paperless has two components:</strong></p>

    <h3>1. Backend (Runs on Homecloud)</h3>
    <ul>
      <li>Stores and organizes your documents into a searchable archive.</li>
      <li>Supports many formats including PDFs, Office docs, and images.</li>
      <li>Performs automatic tagging and classification.</li>
    </ul>

    <h3>2. Frontend (Mobile App & Web App)</h3>
    <ul>
      <li>Scan documents directly using your phone camera.</li>
      <li>Search and access your document archive on the go.</li>
      <li>Share specific documents securely with family or friends — they can create their own accounts on your Paperless instance. They would need to access your Tailscale VPN to connect to Homecloud.</li>
    </ul>

    <h2>Deployment Notice</h2>
    <p>
      Paperless is an open-source third-party application. Before deploying, please read more about it here:<br> 
      <a href="https://docs.paperless-ngx.com/" class="plainLink" target="_blank">https://docs.paperless-ngx.com/</a>
    </p>

    <h2>Getting Started</h2>
    <ul>
      <li>Go to deploy section below to deploy the app.</li>
      <li class="init-login-info">Make sure to note down the username and password displayed at the end of the deployment. If you miss to do that, go to Homecloud workbench under <strong>"Configure >> Apps >> Documents >> Password"</strong> to reset the password.</li>
      <li>After deploying, go to the <a class="plainLink" href="#/setupwizard/apps/paperless/access">access page</a> to start using the app.</li>
    </ul>
    </div>

  <div class="right-column">
    <img src="/assets/images/paperless-dark.png" alt="Paperless dashboard image">
  </div>
</div>

    
`;

 

  public config2: FormPageConfig = {
      request: {
        service: 'Homecloud',
        get: {
          method: 'paperless_get_latest_version'
        }
      },
      fields: [
      {
        type: 'textInput',
        name: 'version',
        label: gettext('Latest Paperless-ngx version available to deploy'),
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
        label: gettext('Yes,I want to Deploy Paperless-ngx'),
        hint: gettext('By checking this box, you agree to install opensource paperless-ngx app directly from project repository. If first time deployment (or done app reset) then use the username password provided in the task dialog for login. '),
        value: false,
        readonly: false
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Deploy Paperless-ngx on Homecloud',
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
                title: gettext('Paperless Deployment Status'),
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
                  method: 'paperless_update_version',
                  params:{
                    version:'{{ version}}'
                  }
                }
              },
            successUrl:'/setupwizard/apps/paperless/access'
            //successUrl:window.location.pathname
            }
        }
      }
      
      

    ]
  };

  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'paperless_check_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Paperless backend service version in-use'),
        value: '',
        readonly: true
      }
      /*,
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Paperless'),
        hint: gettext('By checking this box, you agree to remove Paperless-ngx app from Homecloud'),
        value: false,
        readonly: false
      }
        */
    ],
    /*buttons:[
      {
        template: 'submit',
        text:'Remove Paperless-ngx from Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'This will remove Paperless application and configuration. Your data will not be deleted. Do you want to continue?'
          )
        },
        execute: {
            type: 'taskDialog',
            taskDialog: {
              config: {
                title: gettext('Paperless Removal Status'),
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
                  method: 'paperless_remove'

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
    this.rpcService.request('Homecloud', 'getPaperlessServiceStatus').subscribe(response => {
      const status = response.status;
      //console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }

  updateFieldVisibility(status:string):void{
  //  console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form2 omv-form-checkbox');
    const checkboxRemove=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form3 omv-form-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-paperless-main-page  #paperless-main-form2 omv-submit-button button');
    
    const paperlessMainForm2=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form2');
    const paperlessMainForm3=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form3');
   
    if(status === 'Not deployed'){
      
      console.log('status is not deployed');
      paperlessMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      this.rpcService.request('Homecloud', 'paperless_get_latest_version').subscribe(response => {
        const version = response.version;
        const message = response.message;
        console.log('version', version);
        console.log('message',message);
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
      paperlessMainForm2.classList.add('hidden');
      checkboxRemove.classList.remove('hidden');
      this.checkboxRemoveListener();
     
    }
  }

  checkboxDeployListener(){
    const checkboxDeploy=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form2 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-paperless-main-page  #paperless-main-form2 omv-submit-button button');
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
    const removeButton = document.querySelector('omv-setupwizard-paperless-main-page  #paperless-main-form3 omv-submit-button button');
    const checkboxRemove=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form3 omv-form-checkbox mat-checkbox');
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
        text:'< Prev: Photos app access',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/photos/access'
        }
        
      },
      
      {template:'submit',
        text:'Next: Documents app access >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkDocsAppDeployForWizard',
            task:false,
            progressMessage:gettext('Please wait, checking documents app setup ...'),
            successNotification: gettext('Documents app is deployed successfully.'),
            successUrl:'/setupwizard/apps/paperless/access',
            
          }
        }
      },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip Documents app Setup',
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
              'lastCompletedStepName':'appsPaperlessAccess'
            },
            successUrl:'/setupwizard/apps/notes',
          }
        }
      }
    
    ]
  };
  

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-paperless-main-page #navButtons omv-submit-button button');
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
