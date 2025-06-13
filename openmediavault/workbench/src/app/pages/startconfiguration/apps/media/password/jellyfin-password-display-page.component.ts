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
  selector:'omv-jellyfin-password-display-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="jellyfin-password-display-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="jellyfin-password-display-form2" [config]="this.config2"></omv-intuition-form-page>
  `,
  styleUrls: ['./jellyfin-password-display-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsJellyfinPasswordResetDisplayComponent extends BaseFormPageComponent {

  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('PIN for user selected at forgot password page. Enter this PIN at Jellyfin page prompting for PIN')
      },
    ]
  };

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'get_pin_jellyfin'
      }
    },
    fields: [
      
      {
        type: 'textInput',
        name: 'user',
        label: gettext('Jellyfin user id'),
        hint: gettext('If blank then either PIN has expired or not generated. Generate a new pin and try again.'),
        value: '',
        readonly: true,
        hasCopyToClipboardButton:true
      },
      {
        type: 'textInput',
        name: 'pin',
        label: gettext('PIN'),
        hint: gettext('Use this PIN to reset password at Jellyfin page. After reset it can be used for login. Post login remember to change your password from profile page.'),
        value: '',
        readonly: true,
        hasCopyToClipboardButton:true
      }

    ]
  };

}
