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
  selector:'omv-urbackup-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
   <div id="urbackupbackup-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
   </div>
  <omv-intuition-form-page id="urbackup-main-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="urbackup-main-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./urbackup-form-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None,

  
})

export class AppsUrbackupMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `
    <div class="content-wrapper">
      <div class="left-column">
        <div class="urbackup-logo"></div>
        <p class="intro-text">
          UrBackup is Open Source client/server backup system, that through a combination of image and file backups accomplishes both data safety and a fast restoration time. It is well suited for laptop backups for organizations.
          File and image backups are made while the system is running without interrupting current processes. UrBackup also continuously watches folders you want backed up in order to quickly find differences to previous backups. Because of that, incremental file backups are really fast.
        </p>
        <h2>Key Features:</h2>
        <ul>
          <li><strong>Fast</strong><br>
            The custom client makes fast file and image backups possible.
          </li>

          <li><strong>Web interface</strong><br>
            The backup server has an integrated web interface that shows the status of the clients, current activities and statistics.
          </li>

          <li><strong>Space efficient</strong><br>
            If multiple clients have the same files the UrBackup server saves them only once, leading to reduced storage requirements.
          </li>
        </ul>


        <h2>Deployment Notice</h2>
        <p>
          UrBackup is an open-source third-party application. Before deploying, please read more about it here:<br> 
          <a href="https://www.urbackup.org/" class="plainLink" target="_blank">https://www.urbackup.org/</a>
        </p>

        <h2>Getting Started</h2>
        <p>Follow below instructions for deployment.</p>
        <p>After deploying, go to the <a class="plainLink" href="#/startconfiguration/apps/urbackup/access">access page</a> to start using the app.</p>
      </div>

      <div class="right-column">
        <img src="/assets/images/urbackup.png" alt="UrBackup dashboard image">
      </div>
    </div>

    
`;
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getUrbackupServiceStatus'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('Homecloud supports opensource backup solution named Urbackup.')
      }
    ]
  };

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'urbackup_get_latest_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'version',
        label: gettext('Latest Urbackup version available to deploy'),
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
        label: gettext('Yes,I want to Deploy UrBackup'),
        hint: gettext('By checking this box, you agree to install the Urbackup app directly from project repository'),
        value: false,
        readonly: false
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Deploy UrBackup on Homecloud',
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
                title: gettext('Urbackup Deployment Status'),
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
                  method: 'urbackup_update_version',
                  params:{
                    version:'{{ version}}',
                  }

                }
              },
            successUrl:'/startconfiguration/apps/urbackup/access'
            }
        }
      }
      
      

    ]
  };
  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'urbackup_check_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Urbackup backend service version in-use'),
        value: '',
        readonly: true
      },
      
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Urbackup'),
        hint: gettext('By checking this box, you agree to remove the Urbackup app from homecloud'),
        value: false,
        readonly: false
      }
    ],
    buttons:[
      {
        template: 'submit',
        text:'Remove UrBackup from Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'This will remove UrBackup` application and configuration. Do you want to continue?'
          )
        },
        execute: {
            type: 'taskDialog',
            taskDialog: {
              config: {
                title: gettext('Urbackup Removal Status'),
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
                  method: 'urbackup_remove'

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
    this.rpcService.request('Homecloud', 'getUrbackupServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status
    });
  }
 

  updateFieldVisibility(status:string):void{
  //  console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-urbackup-main-page #urbackup-main-form2 omv-form-checkbox');
    const checkboxRemove=document.querySelector('omv-urbackup-main-page #urbackup-main-form3 omv-form-checkbox');
    const deployButton = document.querySelector('omv-urbackup-main-page  #urbackup-main-form2 omv-submit-button button');
    
    const urbackupMainForm2=document.querySelector('omv-urbackup-main-page #urbackup-main-form2');
    const urbackupMainForm3=document.querySelector('omv-urbackup-main-page #urbackup-main-form3');
   
    if(status === 'Not deployed'){
      
     // console.log('status is not deployed');
      urbackupMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      this.rpcService.request('Homecloud', 'urbackup_get_latest_version').subscribe(response => {
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
      urbackupMainForm2.classList.add('hidden');
      checkboxRemove.classList.remove('hidden');
      this.checkboxRemoveListener();
     
    }
  }

  checkboxDeployListener(){
    const checkboxDeploy=document.querySelector('omv-urbackup-main-page #urbackup-main-form2 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-urbackup-main-page  #urbackup-main-form2 omv-submit-button button');
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
    const removeButton = document.querySelector('omv-urbackup-main-page  #urbackup-main-form3 omv-submit-button button');
    const checkboxRemove=document.querySelector('omv-urbackup-main-page #urbackup-main-form3 omv-form-checkbox mat-checkbox');
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
