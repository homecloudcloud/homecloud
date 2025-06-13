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
  selector:'omv-jellyfin-resetpassword-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="jellyfin-resetpassword-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="jellyfin-resetpassword-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="jellyfin-resetpassword-form3" [config]="this.config3"></omv-intuition-form-page> 
  `,
  styleUrls: ['./jellyfin-resetpassword-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsJellyfinResetPasswordComponent extends BaseFormPageComponent {
 
  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('If you have forgotten your Jellyin app userid or password, follow below steps to recover password. ')
      }
    ]
  };
  
  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'jellyfin_getusers'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('User id(s) in Jellyfin.')
      },
      {
        type: 'textInput',
        name: 'users',
        label: gettext('Jellyfin user(s) list '),
        hint: gettext('Blank means no Jellyfin user created yet. Go to Access page and open WebApp to create first user'),
        value: '',
        readonly: true
      }
    ]
  };

  public config3: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext('To reset password Open Jellyfin web app (---enter link here ----)and click Forgot Password. Enter user for which password need to be reset and press Submit')
      },
      {
        type: 'paragraph',
        title: gettext('After submission return to this page and press show pin button below.')
      },
      {
        type: 'paragraph',
        title: gettext('')
      }
    ],
    buttons: [
      {
        text: 'Show generated PIN',
        disabled:false,
        submit:true,
       // class:'omv-background-color-pair-primary',
        class:'lightblue white',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'Make sure you have generated PIN from Jellyfin webapp using Forgot Password option before proceeding further. You want to continue?'
        },
        execute: {
          type: 'url',
          url: '/startconfiguration/apps/media/password/display'
        }
      }
    ],
    buttonAlign: 'start' // You can adjust the alignment to 'start', 'center', or 'end'

  };
 
 
}
