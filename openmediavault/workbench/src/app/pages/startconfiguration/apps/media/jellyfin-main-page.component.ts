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
  selector:'omv-jellyfin-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <div id="jellyfin-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
   </div>
  <omv-intuition-form-page id="jellyfin-main-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="jellyfin-main-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./jellyfin-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsJellyfinMainComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `
    <div class="content-wrapper">
      <div class="left-column">
        <div class="jellyfin-logo"></div>
        <p class="intro-text">
          Jellyfin is the volunteer-built media solution that puts you in control of your media. Stream to any device from Homecloud, with no strings attached. Jellyfin enables you to collect, manage, and stream your media. Run the Jellyfin server on your Homecloud and gain access to the leading free-software entertainment system, bells and whistles included.
        </p>
        <h2>Key Features:</h2>
        <ul>
          <li><strong>Media Library Management</strong><br>
            Automatically organizes your TV shows, movies, music, and photos.Pulls metadata, posters, trailers, and subtitles from online sources.
          </li>

          <li><strong>Streaming to Any Device</strong><br>
            Stream media to web browsers, smart TVs, mobile apps, Kodi, and DLNA devices.
          </li>

          <li><strong>Fully Free & Open Source (No Telemetry)</strong><br>
            No licensing fees, subscriptions, or proprietary lock-in.
          </li>


        </ul>

        <h2>How It Works</h2>
        <p><strong>Jellyfin has two components:</strong></p>

        <h3>1. Backend (Runs on Homecloud)</h3>
        <ul>
          <li>It stores all your media on Homecloud privately. No data is stored on any public cloud.</li>
        </ul>

        <h3>2. Frontend (Mobile App & Web App)</h3>
        <ul>
          <li>Multiple apps like WebApp (Browser based from any platform), Audio book listening app, music app, video app for iOS and Android devices.</li>
         
        </ul>

        <h2>Deployment Notice</h2>
        <p>
          Jellyfin is an open-source third-party application. Before deploying, please read more about it here:<br> 
          <a href="https://jellyfin.org/" class="plainLink" target="_blank">https://jellyfin.org/</a>
        </p>

        <h2>Getting Started</h2>
        <p>Follow below instructions for deployment.</p>
        <p>After deploying, go to the <a class="plainLink" href="#/startconfiguration/apps/media/access">access page</a> to start using the app.</p>
      </div>

      <div class="right-column">
        <img src="/assets/images/jellyfin.png" alt="Jellyfin dashboard image">
      </div>
    </div>

    
`;
  

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
        type: 'textInput',
        name: 'message',
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
            successUrl:'/startconfiguration/apps/media/access'
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
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Jellyfin'),
        hint: gettext('By checking this box, you agree to remove Jellyfin app from Homecloud'),
        value: false,
        readonly: false
      }
    ],
    buttons:[
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
            successUrl:'/startconfiguration/apps/media/access'
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
    this.rpcService.request('Homecloud', 'getJellyfinServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldVisibility(status); //Hide or show the checkbox for updates based on status     
        
    });
  }



  updateFieldVisibility(status:string):void{
  //  console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-jellyfin-main-page #jellyfin-main-form2 omv-form-checkbox');
    const checkboxRemove=document.querySelector('omv-jellyfin-main-page #jellyfin-main-form3 omv-form-checkbox');
    const deployButton = document.querySelector('omv-jellyfin-main-page  #jellyfin-main-form2 omv-submit-button button');
    
    const photosMainForm2=document.querySelector('omv-jellyfin-main-page #jellyfin-main-form2');
    const photosMainForm3=document.querySelector('omv-jellyfin-main-page #jellyfin-main-form3');
   
    if(status === 'Not deployed'){
      
     // console.log('status is not deployed');
      photosMainForm3.classList.add('hidden');
      checkboxDeploy.classList.remove('hidden');
      this.rpcService.request('Homecloud', 'jellyfin_get_latest_version').subscribe(response => {
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
    const checkboxDeploy=document.querySelector('omv-jellyfin-main-page #jellyfin-main-form2 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-jellyfin-main-page  #jellyfin-main-form2 omv-submit-button button');
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
    const removeButton = document.querySelector('omv-jellyfin-main-page  #jellyfin-main-form3 omv-submit-button button');
    const checkboxRemove=document.querySelector('omv-jellyfin-main-page #jellyfin-main-form3 omv-form-checkbox mat-checkbox');
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
