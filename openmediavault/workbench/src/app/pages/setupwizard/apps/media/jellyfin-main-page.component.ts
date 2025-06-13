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
  selector:'omv-setupwizard-jellyfin-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <omv-intuition-form-page id="jellyfin-main-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="jellyfin-main-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="jellyfin-main-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-intuition-form-page id="navButtons" [config]="this.navConfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./jellyfin-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsJellyfinMainComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getJellyfinServiceStatus'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('Homecloud supports opensource media server Jellyfin.')
      },
      {
        type: 'paragraph',
        title: gettext('Jellyfin is the volunteer-built media solution that puts you in control of your media. Stream to any device from your own server, with no strings attached. Your media, your server, your way.')
      },
      {
        type: 'paragraph',
        title: gettext('Jellyfin enables you to collect, manage, and stream your media. Run the Jellyfin server on your Homecloud and gain access to the leading free-software entertainment system, bells and whistles included.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('Jellyfin has two components: 1. Backend service that runs on Homecloud. It stores all your media on Homecloud within privacy and security of your Home. No data is stored on any public cloud')
      },
      {
        type: 'paragraph',
        title: gettext('2.Frontend which is based on multiple apps like WebApp (Browser based from any platform), Audio book listening app, music app, video app for iOS and Android devices.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext(` This is an open source 3rd party software. By clicking deploy you agree to terms and conditions enter link here. To learn more about Jellyfin visit open source project at:&nbsp;&nbsp; <a class="plainLink" href="https://jellyfin.org/" target="_blank">Learn more about Jellyfin </a> `)
      }
    ]
  };

  public config2: FormPageConfig = {
      request: {
        service: 'Homecloud',
        get: {
          method: 'jellyfin_get_latest_version'
        }
      },
      fields: [
      {
        type: 'textInput',
        name: 'version',
        label: gettext('Latest Jellyfin version available to deploy'),
        hint: gettext('This version will be deployed'),
        value: '',
        readonly: true
      },
      {
        type: 'checkbox',
        name: 'deployConfirmation',
        label: gettext('Yes,I want to Deploy Jellyfin'),
        hint: gettext('By checking this box, you agree to install opensource Jellyfin app directly from project repository.'),
        value: false,
        readonly: false
      },
      {
        type: 'paragraph',
        placeholder: gettext('A media share will be created in Drive to upload media files like movies, songs. Go to Jellyfin console to create a library and add that folder.')
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Deploy Jellyfin on Homecloud',
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
                  method: 'jellyfin_update_version',
                  params:{
                    version:'{{ version}}'
                  }
                }
              },
            successUrl:'/startconfiguration/apps/jellyfin'
            }
        }
      }
    ]
  };




  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'jellyfin_check_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Jellyfin backend service version in-use'),
        value: '',
        readonly: true
      },
   /*   {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Jellyfin'),
        hint: gettext('By checking this box, you agree to remove Jellyfin app from Homecloud'),
        value: false,
        readonly: false
      }*/
    ],
 /*   buttons:[
      {
        template: 'submit',
        text:'Remove Jellyfin from Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'This will remove Jellyfin application and configuration. Your data will not be deleted. Do you want to continue?'
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
                  method: 'jellyfin_remove'

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
      this.enableNavButtons();
      
      // Select all paragraph elements 
      const paragraphs = document.querySelectorAll('#jellyfin-main-form1 .omv-form-paragraph');
      


      paragraphs[7].innerHTML =
      (this.config.fields[7].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[7].title?.toString();
      
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
    
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getJellyfinServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }

  updateFieldVisibility(status:string):void{
    console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-setupwizard-jellyfin-main-page #jellyfin-main-form2 omv-form-checkbox mat-checkbox');
    const checkboxRemove=document.querySelector('omv-setupwizard-jellyfin-main-page #jellyfin-main-form3 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-jellyfin-main-page  #jellyfin-main-form2 omv-submit-button button');
    const removeButton = document.querySelector('omv-setupwizard-jellyfin-main-page  #jellyfin-main-form3 omv-submit-button button');
    const jellyfinMainForm2=document.querySelector('omv-setupwizard-jellyfin-main-page #jellyfin-main-form2');
    const jellyfinMainForm3=document.querySelector('omv-setupwizard-jellyfin-main-page #jellyfin-main-form3');
   
    if(status === 'Not deployed'){
      console.log('status is not deployed');
      jellyfinMainForm3.classList.add('hidden');
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
      jellyfinMainForm2.classList.add('hidden');
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
  public navConfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Password manager app Setup',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/password-manager'
        }
        
      },
      
      {template:'submit',
        text:'Next: Finish set up >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkMediaAppDeployForWizard',
            task:false,
            progressMessage:gettext('Please wait, checking Media app setup ...'),
            successUrl:'/setupwizard/complete',
            
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
              'lastCompletedStepName':'appsMedia',
            },
            successUrl:'/setupwizard/complete',
          }
        }
      }
    
    ]
  };
  

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-jellyfin-main-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }

}
