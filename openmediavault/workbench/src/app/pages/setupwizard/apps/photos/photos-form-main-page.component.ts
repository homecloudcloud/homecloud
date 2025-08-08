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
import { DomSanitizer,SafeHtml} from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';



@Component({
  selector:'omv-setupwizard-photos-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
    <div id="photos-main-form1">
      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
    </div>
    <omv-intuition-form-page id="photos-main-form2" [config]="this.config2"></omv-intuition-form-page>
    <omv-intuition-form-page id="photos-main-form3" [config]="this.config3"></omv-intuition-form-page>
  </div>
  
  <omv-intuition-form-page id="navButtons" [config]="this.navconfig"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-form-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsPhotosMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `
    <div class="content-wrapper">
      <div class="left-column">
        <div class="immich-logo"></div>
        <p class="intro-text">
          Immich is a free, open source self-hosted photo and video management solution. It helps you browse, search and organize your photos and videos with ease, without sacrificing your privacy. All your photos and videos are stored on Homecloud device that is in your complete physical and logical control.
        </p>
        <h2>Key Features:</h2>
        <ul>
          <li><strong>Automatic Backup</strong><br>
            Immich supports uploading photos and videos from your mobile device to Homecloud automatically.
          </li>

          <li><strong>Multi-user support and sharing</strong><br>
            Immich allows multiple users to have their own private library and let them selectively share it with other users.
          </li>

          <li><strong>Facial recognition</strong><br>
            Immich recognizes faces in your photos and videos and groups them together into people. You can then assign names to these people and search for them.
          </li>

          <li><strong>Access photos and videos stored on USB Disks</strong><br>
            Immich can access photos and videos stored on USB disks connected to Homecloud. 
          </li>

        </ul>

        <h2>How It Works</h2>
        <p><strong>Immich has two components:</strong></p>

        <h3>1. Backend (Runs on Homecloud)</h3>
        <ul>
          <li>It stores and indexes photos uploaded by frontend.</li>
        </ul>

        <h3>2. Frontend (Mobile App & Web App)</h3>
        <ul>
          <li>Users can upload photos and videos to backend.</li>
          <li>Frontend app is available for iOS and Android devices. Other devices can access Immich via web browser</li>
          <li>A Web Clipper, to save web pages and screenshots from your browser, is also available for Firefox and Chrome.</li>
          <li>Share specific notes securely with family or friends — they can create their own accounts on your Joplin instance. They would need to access your Tailscale VPN to connect to Homecloud.</li>
        </ul>

        <h2>Deployment Notice</h2>
        <p>
          Immich is an open-source third-party application. Before deploying, please read more about it here:<br> 
          <a href="https://immich.app/" class="plainLink" target="_blank">https://immich.app/</a>
        </p>

        <h2>Getting Started</h2>
        <p>Follow below instructions for deployment.</p>
        <p>After deploying, go to the <a class="plainLink" href="#/setupwizard/apps/photos/access">access page</a> to start using the app.</p>
      </div>

      <div class="right-column">
        <img src="/assets/images/Immich_image.webp" alt="Immich dashboard image">
      </div>
    </div>

    
`;
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getImmichServiceStatus'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('Homecloud supports opensource photo and video management solution named Immich.')
      },
      {
        type: 'paragraph',
        title: gettext('Immich helps you browse, search and organize your photos and videos with ease, without sacrificing your privacy. All your photos and videos are stored on Homecloud device that is in your complete physical and logical control.')
      },
     
    
    
     
    ]
  };

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'immich_get_latest_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'version',
        label: gettext('Latest Immich version available to deploy'),
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
        label: gettext('Yes,I want to Deploy Immich'),
        hint: gettext('By checking this box, you agree to install the immich app directly from project repository'),
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
                title: gettext('Immich Deployment Status'),
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
                  method: 'immich_update_version',
                  params:{
                    version:'{{ version}}',
                  }

                }
              },
            successUrl:'/setupwizard/apps/photos/access'
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
        method: 'immich_check_version'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'deployed_version',
        label: gettext('Currently deployed backend service version'),
        hint: gettext('Immich backend service version in-use'),
        value: '',
        readonly: true
      }
      /*,
      
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Immich'),
        hint: gettext('By checking this box, you agree to remove the immich app from homecloud'),
        value: false,
        readonly: false
      }
        */
    ],
    /*buttons:[
      {
        template: 'submit',
        text:'Remove Immich from Homecloud',
        confirmationDialogConfig:{
          template: 'confirmation',
          message: gettext(
            'This will remove Immich application and configuration. Your data and media files will not be deleted. Do you want to continue?'
          )
        },
        execute: {
            type: 'taskDialog',
            taskDialog: {
              config: {
                title: gettext('Immich Removal Status'),
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
                  method: 'immich_remove'

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
    this.rpcService.request('Homecloud', 'getImmichServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }
 






  updateFieldVisibility(status:string):void{
  //  console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-setupwizard-photos-main-page #photos-main-form2 omv-form-checkbox');
    const checkboxRemove=document.querySelector('omv-setupwizard-photos-main-page #photos-main-form3 omv-form-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-photos-main-page  #photos-main-form2 omv-submit-button button');
    
    const photosMainForm2=document.querySelector('omv-setupwizard-photos-main-page #photos-main-form2');
    const photosMainForm3=document.querySelector('omv-setupwizard-photos-main-page #photos-main-form3');
   
    if(status === 'Not deployed'){
      
     // console.log('status is not deployed');
      photosMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      this.rpcService.request('Homecloud', 'immich_get_latest_version').subscribe(response => {
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
    const checkboxDeploy=document.querySelector('omv-setupwizard-photos-main-page #photos-main-form2 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-setupwizard-photos-main-page  #photos-main-form2 omv-submit-button button');
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
    const removeButton = document.querySelector('omv-setupwizard-photos-main-page  #photos-main-form3 omv-submit-button button');
    const checkboxRemove=document.querySelector('omv-setupwizard-photos-main-page #photos-main-form3 omv-form-checkbox mat-checkbox');
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

  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Drive Access',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/drive/access'
        }
        
      },
      
      {template:'submit',
        text:'Next: Photos app Access >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkPhotosAppDeployForWizard',
            task:false,
            progressMessage:gettext('Please wait, checking photos app setup ...'),
            successNotification: gettext('Photos app is deployed successfully.'),
            successUrl:'/setupwizard/apps/photos/access',
            
          }
        }
      },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip photos app Setup',
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
              'lastCompletedStepName':'appsPhotosAccess'
            },
            successUrl:'/setupwizard/apps/paperless',
          }
        }
      }
    
    ]
  };
  

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-photos-main-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.enableNavButtons();
    }, 100); // Use setTimeout to ensure the DOM is fully loaded before enabling buttons

  }

  
}
