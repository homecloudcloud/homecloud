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
//import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';




@Component({
  selector:'omv-jellyfin-password-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="jellyfin-password-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./jellyfin-password-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsJellyfinPasswordResetComponent extends BaseFormPageComponent {
  
  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('If you forgot password of user with admin priviligies for Jellyfin app you can reset it here. Click the reset button below. After that access Jellyfin WebApp that will start setup wizard to create new admin user password. Existing admin user will be replaced by new user.')
      },
      {
        type: 'paragraph',
        title: gettext('Non-admin user(s) password can be reset by admin user using Webapp. Go to Media->Access page to access Webapp under Dashboard -> Admin -> Users')
      },
      {
        type: 'paragraph',
        title: gettext('Note: This affects only Jellyfin app')
      },
      {
        type: 'paragraph',
        title: gettext('')
      }
    ],
    buttons: [
      {
        template: 'submit',
        text:'Reset password',
        execute: {
            type: 'taskDialog',
            taskDialog: {
              config: {
                title: gettext('Resetting password'),
                autoScroll: false,
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
                showCompletion:true,
                request: {
                  service: 'Homecloud',
                  method: 'jellyfin_reset_password',
                }

              },
              successUrl:'/startconfiguration/apps/media/access'
            }
        }
      }
  
    ],
    buttonAlign: 'start' // You can adjust the alignment to 'start', 'center', or 'end'

  };


}
