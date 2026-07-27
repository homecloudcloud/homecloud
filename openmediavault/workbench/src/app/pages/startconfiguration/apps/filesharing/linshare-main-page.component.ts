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
  selector:'omv-linshare-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <div id="linshare-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-form-page id="linshare-main-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="linshare-main-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./linshare-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsLinshareMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `
    <div class="content-wrapper">
      <div class="left-column">
        <div class="linshare-logo"></div>
        <p class="intro-text">
          Linshare is a OpenSource secure file sharing.
        </p>
        <h2>Key Features:</h2>
        <ul>
          <li><strong>Data control</strong><br>
            Manage your user’s data, with fully customizable settings to control your business network on your own terms  
          </li>

          <li><strong>Email sharing plugin :</strong><br>
            Share big files on email! Use the LinShare plugin to share attachments of unlimited size within your email 
          </li>

          <li><strong>Upload request</strong><br>
            Empower internal and guest users to upload files on a specific project in one place with or without a LinShare account
          </li>

          <li><strong>Activity log</strong><br>
            Visualize events on your files: track shared date, download date, file deletion of your files, and more! 
          </li>

        </ul>

        <h2>How It Works</h2>
        <p><strong>Linshare has two components:</strong></p>

        <h3>1. Backend (Runs on Homecloud)</h3>
        <ul>
          <li>It stores all your notes on Homecloud privately. No data is stored on any public cloud</li>
        </ul>

        <h3>2. Frontend (Mobile App & Web App)</h3>
        <ul>
          <li>Users can take upload files and share with other users.</li>
        </ul>

        <h2>Deployment Notice</h2>
        <p>
          Linshare is an open-source third-party application. Before deploying, please read more about it here:<br> 
          <a href="https://linshare.app/" class="plainLink" target="_blank">https://linshare.app/</a>
        </p>

        <h2>Getting Started</h2>
        <p>Follow below instructions for deployment.</p>
        <p>After deploying, go to the <a class="plainLink" href="#/startconfiguration/apps/notes/access">access page</a> to start using the app.</p>
      </div>

      <div class="right-column">
        <img src="/assets/images/linshare.svg" alt="Linshare dashboard image">
      </div>
    </div>

    
`;
  

  public config2: FormPageConfig = {
      request: {
        service: 'Homecloud',
        get: {
          method: 'linshare_get_latest_version'
        }
      },
      fields: [
      {
        type: 'textInput',
        name: 'version',
        label: gettext('Latest Linshare version available to deploy'),
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
        label: gettext('Yes,I want to Deploy Linshare'),
        hint: gettext('By checking this box, you agree to install opensource Linshare app directly from project repository. If first time deployment (or done app reset) then use the username: root@localhost.localdomain, password: adminlinshare. Make sure to change password after login and update email-id in profile. There is no way to reset admin password without an email id. Also make sure Email is setup in Notifications page. '),
        value: false,
        readonly: false
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Deploy Linshare on Homecloud',
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
                  method: 'linshare_update_version',
                  params:{
                    version:'{{ version}}'
                  }
                }
              },
            successUrl:'/startconfiguration/apps/filesharing/access'
            }
        }
      }
      
      

    ]
  };

  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'linshare_check_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Linshare backend service version in-use'),
        value: '',
        readonly: true
      },
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Linshare'),
        hint: gettext('By checking this box, you agree to remove Linshare app from Homecloud'),
        value: false,
        readonly: false
      }
    ],
    buttons:[
      {
        template: 'submit',
        text:'Remove Linshare from Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'This will remove Linshare application and configuration. Your data will not be deleted. Do you want to continue?'
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
                  method: 'linshare_remove'

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
     // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);

  }

  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
    
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getLinshareServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }


  updateFieldVisibility(status:string):void{
  //  console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-linshare-main-page #linshare-main-form2 omv-form-checkbox');
    const checkboxRemove=document.querySelector('omv-linshare-main-page #linshare-main-form2 omv-form-checkbox');
    const deployButton = document.querySelector('omv-linshare-main-page  #linshare-main-form2 omv-submit-button button');
    
    const photosMainForm2=document.querySelector('omv-linshare-main-page #linshare-main-form2');
    const photosMainForm3=document.querySelector('omv-linshare-main-page #linshare-main-form3');
   
    if(status === 'Not deployed'){
      
     // console.log('status is not deployed');
      photosMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      this.rpcService.request('Homecloud', 'linshare_get_latest_version').subscribe(response => {
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
    const checkboxDeploy=document.querySelector('omv-linshare-main-page #linshare-main-form2 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-linshare-main-page  #linshare-main-form2 omv-submit-button button');
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
    const removeButton = document.querySelector('omv-linshare-main-page  #linshare-main-form3 omv-submit-button button');
    const checkboxRemove=document.querySelector('omv-linshare-main-page #linshare-main-form3 omv-form-checkbox mat-checkbox');
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


}
