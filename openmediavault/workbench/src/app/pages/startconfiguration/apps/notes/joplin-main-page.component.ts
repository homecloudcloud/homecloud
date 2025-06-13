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
  selector:'omv-joplin-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="joplin-main-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="joplin-main-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="joplin-main-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./joplin-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsJoplinMainComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getJoplinServiceStatus'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('Homecloud supports opensource Notes app: Joplin.')
      },
      {
        type: 'paragraph',
        title: gettext('Joplin is a free, open source note taking and to-do application, which can handle a large number of notes organised into notebooks. The notes are searchable, can be encrypted, copied, tagged and modified either from the applications directly or from your own text editor. ')
      },
      {
        type: 'paragraph',
        title: gettext('Joplin is "offline first", which means you always have all your data on your phone or computer. This ensures that your notes are always accessible, whether you have an internet connection or not.All your private personal documents are transformed using optical character recognition (OCR) to searchable archive accessible on any device. All data resides on Homecloud in your physical and logical control giving you privacy and control.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('Joplin has two components: 1. Backend service that runs on Homecloud. It stores all your notes on Homecloud within privacy and security of your Home. No data is stored on any public cloud')
      },
      {
        type: 'paragraph',
        title: gettext('2.Frontend which is a app that can be used to take notes, import/export notes and share among users. The application is available for Windows, Linux, macOS, Android and iOS. A Web Clipper, to save web pages and screenshots from your browser, is also available for Firefox and Chrome.')
      },
      {
        type: 'paragraph',
        title: gettext('You can also selectively share notes with your family, friends who also can create account on Joplin app deployed on your Homecloud. They would need to acces your Tailscale VPN to connect to Homecloud.')
      },
      {
        type: 'paragraph',
        title: gettext(` This is an open source 3rd party software. By clicking deploy you agree to terms and conditions enter link here. To learn more about Joplin visit open source project at:&nbsp;&nbsp; <a class="plainLink" href="https://joplinapp.org/" target="_blank">Learn more about Joplin </a> `)
      }
    ]
  };

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
            successUrl:'/startconfiguration/apps/joplin'
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
      },
      {
        type: 'checkbox',
        name: 'removeConfirmation',
        label: gettext('Yes,I want to remove Joplin'),
        hint: gettext('By checking this box, you agree to remove Joplin app from Homecloud'),
        value: false,
        readonly: false
      }
    ],
    buttons:[
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
      const paragraphs = document.querySelectorAll('#joplin-main-form1 .omv-form-paragraph');
      


      paragraphs[7].innerHTML =
      (this.config.fields[7].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[7].title?.toString();
      
    }, 100); // Timeout ensures it happens after the view has rendered
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
    console.log('deploy status',status);
    const checkboxDeploy=document.querySelector('omv-joplin-main-page #joplin-main-form2 omv-form-checkbox mat-checkbox');
    const checkboxRemove=document.querySelector('omv-joplin-main-page #joplin-main-form3 omv-form-checkbox mat-checkbox');
    const deployButton = document.querySelector('omv-joplin-main-page  #joplin-main-form2 omv-submit-button button');
    const removeButton = document.querySelector('omv-joplin-main-page  #joplin-main-form3 omv-submit-button button');
    const joplinMainForm2=document.querySelector('omv-joplin-main-page #joplin-main-form2');
    const joplinMainForm3=document.querySelector('omv-joplin-main-page #joplin-main-form3');
   
    if(status === 'Not deployed'){
      console.log('status is not deployed');
      joplinMainForm3.classList.add('hidden');
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
      joplinMainForm2.classList.add('hidden');
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
