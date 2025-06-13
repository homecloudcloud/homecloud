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

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';




@Component({
  selector:'omv-setupwizard-drive-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `<omv-logo-header></omv-logo-header>
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,
  styleUrls: ['./drive-form-page.component.scss'],

  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsDriveMainComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('Drive offers network storage accessible via your local network or VPN. Its perfect for storing frequently updated files such as Excel sheets, Word documents, and more. Drive also supports laptop backups and is fully compatible with Apple Time Machine.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('USB drives connected to Homecloud are automatically made available as network shares. Manage their access permissions from Shares page.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('To get started, head over to the Users page.')
      }
    ]
  };
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Notification Settings',
        execute:
        {
          type:'url',
          url:'/setupwizard/notificationsettings'
        }
        
      },
      
      {template:'submit',
        text:'Next: Photos app Setup >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkDriveUserSetupForWizard',
            params:{"start":0,"limit":-1},
            task:false,
            progressMessage:gettext('Please wait, checking user setup for drive ...'),
            successUrl:'/setupwizard/apps/photos',
            
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
              'lastCompletedStepName':'appsDrive'
            },
            successUrl:'/setupwizard/apps/photos',
          }
        }
      }
    
    ]
  };
  ngAfterViewInit() {
    setTimeout(() => {
      this.enableNavButtons();
      
      document.querySelector('meta[name="viewport"]').setAttribute("content", "width=device-width, initial-scale=1.0, user-scalable=yes");
      
    }, 100);
  }

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-drive-main-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
  
}
