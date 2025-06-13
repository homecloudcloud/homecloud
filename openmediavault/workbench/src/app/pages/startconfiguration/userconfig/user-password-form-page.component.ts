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
import { FormPageConfig} from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  selector:'omv-password-change-page'  //Home cloud changes
})
export class UserPasswordFormPageComponent extends BaseFormPageComponent {
  constructor(private cdr: ChangeDetectorRef) {
    super();
  }


  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      post: {
        method: 'setPasswordByContextAll'  /*home cloud changes*/
      }

    },

    fields: [
      {
        type: 'passwordInput',
        name: 'password',
        label: gettext('New password'),
        autocomplete: 'new-password',
        validators: {
          required: true,
           /**Home cloud changes start */
           custom: [
            {
              constraint: {
                operator: '>=',
                arg0: {
                  operator: 'length',
                  arg0: { prop: 'password' }
                },
                arg1: 8
              },
              errorData: gettext('Password must be at least 8 characters long.')
            }
          ]
          /**Home cloud changes end */
        }
      },
      {
        type: 'passwordInput',
        name: 'passwordconf',
        label: gettext('Confirm password'),
        submitValue: false,
        validators: {
          required: true,
          custom: [
            {
              constraint: {
                operator: 'eq',
                arg0: { prop: 'password' },
                arg1: { prop: 'passwordconf' }
              },
              errorData: gettext("Password doesn't match.")
            }
          ]
        }
      }
    ],

    buttons: [
      {
        template: 'submit',
        execute: {
          type: 'url',
          url: '/startconfiguration/userconfig'
        }

      },
      {
        template: 'cancel',
        execute: {
          type: 'url',
      //    type:'click',
      //    click:this.clearValues.bind(this)
        url: '/startconfiguration/userconfig'
        }
      }
    ]
  };

  clearValues(){
     // Manually clear or reset the fields in the config
     console.log('clearing values');
     // Reset reactive form controls to empty
    this.page.setFormValues({password:'',passwordconf:''});
    this.cdr.detectChanges(); // Manually trigger change detection

  }


}
