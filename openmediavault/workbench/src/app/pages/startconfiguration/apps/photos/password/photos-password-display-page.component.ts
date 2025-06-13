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
  selector:'omv-photos-password-display-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="photos-password-display-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="photos-password-display-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="photos-password-display-form3" [config]="this.config3"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-password-display-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosPasswordResetDisplayComponent extends BaseFormPageComponent {

  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('Password for user with admin priviliges is successfully reset')
      },
    ]
  };

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'immich_get_admin_users'
      }
    },
    fields: [
      
      {
        type: 'textInput',
        name: 'email',
        label: gettext('Immich user id'),
        hint: gettext('New password generated for this user'),
        value: '',
        readonly: true,
        hasCopyToClipboardButton:true
      }

    ]
  };

  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'immich_reset_admin_password'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('New password is shown below. Save this password to login using Webapp or Phone app')
      },
      {
        type: 'textInput',
        name: 'password',
        label: gettext('New password'),
        hint: gettext('To change the password -> login to webapp using this id  > Account Settings -> Password'),
        value: '',
        readonly: true,
        hasCopyToClipboardButton:true
      }

    ]
  };

}
