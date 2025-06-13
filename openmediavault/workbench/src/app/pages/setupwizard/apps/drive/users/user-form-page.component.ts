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
  selector:'omv-setupwizard-drive-user-form-page',
  template: `<omv-logo-header></omv-logo-header> 
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,
  
  styles: [`
    @import '../../../../../../assets/colors.scss';

    omv-setupwizard-drive-user-form-page{
      omv-top-bar-wizard .omv-top-bar{
        background:transparent!important;
        position: absolute;
        left:80vw;
    }

        omv-logo-header{
          position:fixed;
          height:20vh;
          top:0;
          left:0;
          z-index:100;
        }

        #mainContent{
          .mat-card{
            margin-top:12rem;
          }
        }
        #navButtons{
          .mat-card{
              background-color:$blue!important;
          }
          mat-card-content{
              display:none!important;
          }
          .mat-card-actions{
              justify-content:flex-end!important;          
          } 
        } 
    }
    `],
  
  
  encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
})
export class UserFormPageComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getUser',
        params: {
          name: '{{ _routeParams.name }}'
        }
      },
      post: {
          method: 'setUserAll'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'name',
        label: gettext('Name'),
        disabled: '{{ _routeConfig.data.editing | toboolean }}',
        value: '{{ _routeParams.name }}',
        autocomplete: 'off',
        validators: {
          required: true,
          patternType: 'userName'
        }
      },
      {
        type: 'textInput',
        name: 'email',
        label: gettext('Email'),
        value: '',
        autocomplete: 'off',
        validators: {
          patternType: 'email'
        }
      },
      {
        type: 'passwordInput',
        name: 'password',
        label: gettext('Password'),
        value: '',
        autocomplete: 'new-password',
        validators: {
          required: '{{ _routeConfig.data.editing | toboolean === false }}',
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
        value: '',
        autocomplete: 'new-password',
        validators: {
          custom: [
            {
              constraint: {
                operator: 'eq',
                arg0: { prop: 'password' },
                arg1: { prop: 'passwordconf' }
              },
              errorData: gettext('Password does not match.')
            }
          ]
        }
      },
      {
        type: 'hidden',
        name: 'shell',
        label: gettext('Shell'),
        placeholder: gettext('Select a shell ...'),
        value: '/bin/sh',
        store: {
          proxy: {
            service: 'System',
            get: {
              method: 'getShells'
            }
          },
          sorters: [
            {
              dir: 'asc',
              prop: 'text'
            }
          ]
        }
      },
      {
        type: 'hidden',
        name: 'groups',
        label: gettext('Groups'),
        placeholder: gettext('Select groups ...'),
        multiple: true,
        valueField: 'name',
        textField: 'name',
        value: [],
        store: {
          proxy: {
            service: 'UserMgmt',
            get: {
              method: 'enumerateAllGroups'
            }
          },
          sorters: [
            {
              dir: 'asc',
              prop: 'name'
            }
          ]
        }
      },
      {
          type: 'hidden',
          name: 'sshpubkeys',
          value: []  // This ensures an empty array is sent in the POST request
      },
      {
        type: 'checkbox',
        name: 'disallowusermod',
        label: gettext('Disallow account modification'),
        value: false,
        hint: gettext('Disallow the user to modify their own account.')
      },
      {
        //type: 'tagInput',
        type: 'hidden',
        name: 'comment',
        label: gettext('Tags'),
        value: '',
        validators: {
          maxLength: 65
        }
      }
    ],
    buttons: [
      {
        template: 'submit',
        execute: {
          type: 'url',
          url: '/setupwizard/apps/drive/users'
        }
      },
      {
        template: 'cancel',
        execute: {
          type: 'url',
          url: '/setupwizard/apps/drive/users'
        }
      }
    ]
  };
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'<< Go Back: Drive Set Up',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/drive'
        }
        
      }
    ]


  };
  ngAfterViewInit(): void {    
       
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {

      this.enableNavButtons();

     
     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  
  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-drive-user-form-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
}
