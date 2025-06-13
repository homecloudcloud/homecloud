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
  selector:'omv-joplin-password-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="joplin-password-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./joplin-password-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsJoplinPasswordResetComponent extends BaseFormPageComponent {
  //private paperlessUser: string = '';
  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('If you forgot password of user for Joplin app you can reset by going to Joplin WebApp and clicking Forgot Password. It will send you an email with password reset link.')
      },
      {
        type: 'paragraph',
        title: gettext('IMPORTANT: Before your can reset your password make sure emails are configured under Notification page. Validate using Test to check if you are receiving mails from Homecloud')
      },
      {
        type: 'paragraph',
        title: gettext('Make sure you update the email in your profile using Joplin Webapp before you can use this functionality ')
      },
      {
        type: 'paragraph',
        title: gettext('')
      }
    ]
  };
}
