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
import { Component,AfterViewInit } from '@angular/core';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';


@Component({
  template: `<omv-complete-logo-header></omv-complete-logo-header>
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             
            `,        
  styleUrls: ['./complete.scss'],
  encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
  selector:'omv-setupwizard-complete-page',  //Home cloud changes
})
export class CompletePageComponent extends BaseFormPageComponent implements AfterViewInit {
  public config: FormPageConfig = {
    
    fields: [
     {
        type:'paragraph',   
        title: gettext('Setup complete! Explore Homecloud features below:')
     }
    ],
    buttons: [
        {
          template:'submit',
          class:'backupButton',
          text:gettext('Backup your data'),
          execute:{
            type:'url',
            url:'/startconfiguration/apps/drive/shares#shared-folder-main-form-2'
          }
        },
        {
          template:'submit',
          class:'photosUSBButton',
          text:gettext('Access photos on USB drives'),
          execute:{
            type:'url',
            url:'/startconfiguration/apps/photos/external-storage'
          }
        },
        {
          template:'submit',
          class:'usbDataButton',
          text:gettext('Access data on USB drives'),
          execute:{
            type:'url',
            url:'/startconfiguration/usb-disks'
          }
        },
         {
            template: 'submit',
            class: 'workbenchButton',
            text: gettext('Explore more on Workbench'),
            execute: {
              type: 'request',
              request:{
                service: 'Flags',
                task:false,
                method: 'saveLastCompletedStep',
                params:{
                  'lastCompletedStepName':'complete',
                },
                successUrl:'/dashboard',
              }
            }
          }
    ]
  };
  
  constructor() {
      super();   
      
   }

   ngAfterViewInit(): void {
    setTimeout(() => {
        const buttons = document.querySelectorAll('omv-setupwizard-complete-page #mainContent omv-submit-button');
        
        buttons.forEach(button => {
          const span = button.querySelector('button .mat-button-wrapper');
          const buttonText = span?.textContent?.trim();
          
          if (buttonText?.includes('Backup your data')) {
            button.classList.add('backupButton');
          } else if (buttonText?.includes('Access photos on USB drives')) {
            button.classList.add('photosUSBButton');
          } else if (buttonText?.includes('Access data on USB drives')) {
            button.classList.add('usbDataButton');
          } else if (buttonText?.includes('Explore more on Workbench')) {
            button.classList.add('workbenchButton');
          }
        });
    }, 100);
  }

    

  
}
