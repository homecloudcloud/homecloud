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
  selector:'omv-setupwizard-paperless-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <omv-intuition-form-page id="paperless-main-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="paperless-main-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="paperless-main-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./paperless-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsPaperlessMainComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getPaperlessServiceStatus'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('Homecloud supports opensource Document manager: Paperless-ngx.')
      },
      {
        type: 'paragraph',
        title: gettext('Paperless-ngx is a document management system that transforms your physical documents into a searchable online archive so you can keep, well, less paper.')
      },
      {
        type: 'paragraph',
        title: gettext('All your private personal documents are transformed using optical character recognition (OCR) to searchable archive accessible on any device. All data resides on Homecloud in your physical and logical control giving you privacy and control.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('Paperless has two components: 1. Backend service that runs on Homecloud. It stores and transforms your documents into searchable archive It supports many formats including pdf, Office formats like doc, xls and even images like JPEG, PNG and more.')
      },
      {
        type: 'paragraph',
        title: gettext('2.Frontend which is a mobile app, webapp that can be used to scan new documents using camera or search, access existing documents.')
      },
      {
        type: 'paragraph',
        title: gettext('You can also selectively share documents with your family, friends who also can create account on Paperless app deployed on your Homecloud')
      },
      {
        type: 'paragraph',
        title: gettext(` This is an open source 3rd party software. By clicking deploy you agree to terms and conditions enter link here. To learn more about Vaultwarden visit open source project at:&nbsp;&nbsp; <a class="plainLink" href="https://github.com/paperless-ngx/paperless-ngx" target="_blank">Learn more about Paperless-ngx </a> `)
      }
    ]
  };

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
            successUrl:'/startconfiguration/apps/paperless'
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
      },
      /*{
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Paperless'),
        hint: gettext('By checking this box, you agree to remove Paperless-ngx app from Homecloud'),
        value: false,
        readonly: false
      }*/
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
            successUrl:'/startconfiguration/apps'
            }
        }
      }
    ]*/

  };
  constructor(private rpcService: RpcService,private sanitizer: DomSanitizer) {
    super();
    // Sanitize the title 
    this.config.fields[7].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[7].title) as unknown as string;


  }

  ngAfterViewInit(): void {
        
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {
      this.enableNavButtons(); // Enable the navigation buttons
      
      // Select all paragraph elements 
      const paragraphs = document.querySelectorAll('#paperless-main-form1 .omv-form-paragraph');
      


      paragraphs[7].innerHTML =
      (this.config.fields[7].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[7].title?.toString();
      
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
    
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getPaperlessServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }

  updateFieldVisibility(status:string):void{
    console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form2 omv-form-checkbox mat-checkbox');
    const checkboxRemove=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form3 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-paperless-main-page  #paperless-main-form2 omv-submit-button button');
    const removeButton = document.querySelector('omv-setupwizard-paperless-main-page  #paperless-main-form3 omv-submit-button button');
    const paperlessMainForm2=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form2');
    const paperlessMainForm3=document.querySelector('omv-setupwizard-paperless-main-page #paperless-main-form3');
   
    if(status === 'Not deployed'){
      
      paperlessMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      checkboxDeploy.addEventListener('click', () => {
        // Add a small delay to ensure class changes are applied
        setTimeout(() => {
            const isChecked = checkboxDeploy.classList.contains('mat-checkbox-checked');
                  
            if (isChecked) {
                deployButton.classList.remove('mat-button-disabled');
                console.log('Deploy button enabled - classes:', deployButton.className);
            } else {
                deployButton.classList.add('mat-button-disabled');
                
            }
        }, 0);
    });
     
    }else{
      console.log('status is deployed');
      paperlessMainForm2.classList.add('hidden');
      checkboxRemove.classList.remove('hidden');
      checkboxRemove.addEventListener('click', () => {
        // Add a small delay to ensure class changes are applied
        setTimeout(() => {
            const isChecked = checkboxRemove.classList.contains('mat-checkbox-checked');
          
            if (isChecked) {
                removeButton.classList.remove('mat-button-disabled');
                removeButton.classList.add('red', 'white');
               
            } else {
                removeButton.classList.add('mat-button-disabled');
                removeButton.classList.remove('red', 'white');
                
            }
        }, 0);
    });
     
    }
  }
  public navConfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Photos app Setup',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/photos'
        }
        
      },
      
      {template:'submit',
        text:'Next: Notes app Setup >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkDocsAppDeployForWizard',
            task:false,
            progressMessage:gettext('Please wait, checking documents app setup ...'),
            successUrl:'/setupwizard/apps/notes',
            
          }
        }
      },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip this step',
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
              'lastCompletedStepName':'appsPaperless'
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

}
