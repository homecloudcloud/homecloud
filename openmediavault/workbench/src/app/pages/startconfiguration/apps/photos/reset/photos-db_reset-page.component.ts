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
  selector:'omv-photos-db_reset-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="photos-db_reset-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-db_reset-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosDBResetComponent extends BaseFormPageComponent {

  public config: FormPageConfig = {
    
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Reset Immich App to fresh state')
      },
      {
        type: 'paragraph',
        title: gettext('IMPORTANT: This will delete Immich users, their uploaded videos, photos, generated thumbnails, faces information in Immich. This CANNOT be undone.')
      },
      {
        type: 'paragraph',
        title: gettext('Highly recommended to take Immich backup before proceeding further')
      },
      {
        type: 'paragraph',
        title: gettext('NOTE: It will NOT delete original media files present in external plugged-in USB disks.')
      }
    ],
    buttons: [
      {
        text: 'Delete ALL Immich users and their uploaded photos and videos',
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
            method: 'reset_immich',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Resetting Immich',
            successNotification: 'Deleted Immich users and all media files',
            successUrl: '/startconfiguration/apps/photos'
          }
        }
      }
    ],
    buttonAlign: 'start' // You can adjust the alignment to 'start', 'center', or 'end'
  };
  


}
