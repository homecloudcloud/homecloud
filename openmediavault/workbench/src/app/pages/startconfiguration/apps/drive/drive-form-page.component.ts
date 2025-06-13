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
  selector:'omv-drive-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="drive-main-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
`
  ,
  styleUrls: ['./drive-form-page.component.scss'],

  styles: [`
    .omv-form-paragraph {
      font-size: var(--mat-font-size-subheading-2) !important;
    }
  `],
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
  
}
