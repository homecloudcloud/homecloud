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





@Component({
  selector:'omv-paperless-db_reset-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="paperless-db_reset-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./paperless-db_reset-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPaperlessDBResetComponent extends BaseFormPageComponent {

  public config: FormPageConfig = {
    
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Reset Paperless-ngx backend to fresh state')
      },
      {
        type: 'paragraph',
        title: gettext('WARNING: This will DELETE ALL Paperless-ngx users and their data including documents uploaded from app. This CANNOT be undone.')
      },
      {
        type: 'paragraph',
        title: gettext('Highly recommended to take Paperles-ngx backup before proceeding further')
      },
      {
        type: 'paragraph',
        title: gettext('')
      }
    ],
    buttons: [
      {
        text: 'Delete ALL Paperless-ngx users and their stored passwords and data',
        disabled:false,
        submit:true,
       // class:'omv-background-color-pair-primary',
        class:'red white',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'STOP! This action cannot be undone. Data is deleted permanently. Do you really want to proceed?'
        },
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'reset_paperless',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Resetting Paperless-ngx',
            successNotification: 'Deleted users and all stored documents',
            successUrl: '/startconfiguration/apps/paperless'
          }
        }
      }
    ],
    buttonAlign: 'start' // You can adjust the alignment to 'start', 'center', or 'end'
  };
  


}
