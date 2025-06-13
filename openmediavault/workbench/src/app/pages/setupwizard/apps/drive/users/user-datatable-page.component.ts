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
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'omv-setupwizard-drive-user-datatable-page',
  template: `<omv-logo-header></omv-logo-header>
             <omv-intuition-form-page id="drive-users" [config]="this.config2"></omv-intuition-form-page>
             <omv-intuition-datatable-page id="datatable-users" [config]="this.config"></omv-intuition-datatable-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,
             styleUrls: ['./user-page.component.scss'],
             
             encapsulation: ViewEncapsulation.None
})
export class UserDatatablePageComponent {
  public config2: FormPageConfig = {
      fields: [
        {
          type: 'paragraph',
          title: gettext(`Each user is automatically assigned a private Drive share, accessible only to them. The share is created when the user is added.`),
          name:'paragraph1'
        },
        {
          type: 'paragraph',
          title: gettext(``),
          name:'paragraph2'
        },
        {
          type: 'paragraph',
          title: gettext(`After creating a user, visit the Access page to start using Drive.`),
          name:'paragraph3'
        }
      ]
  };
  public config: DatatablePageConfig = {
    stateId: '9dd2c07e-4572-4112-9de7-c3ccad5ef52e',
    autoReload: false,
    remoteSorting: true,
    remotePaging: true,
    remoteSearching: true,
    hasSearchField: true,
    rowId: 'name',
    rowEnumFmt: '{{ name }}',
    columns: [
      { name: gettext('Name'), prop: 'name', flexGrow: 1, sortable: true },
      {
        name: gettext('UID'),
        prop: 'uid',
        flexGrow: 1,
        sortable: true,
        hidden: true
      },
      {
        name: gettext('GID'),
        prop: 'gid',
        flexGrow: 1,
        sortable: true,
        hidden: true
      },
      { name: gettext('Email'), prop: 'email', flexGrow: 1, sortable: true },
      {
        name: gettext('Groups'),
        prop: 'groups',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'template',
        cellTemplateConfig: '{{ groups | sort() | join(", ") }}',
        hidden: true
      },
      {
        name: gettext('Tags'),
        prop: 'comment',
        cellTemplateName: 'chip',
        cellTemplateConfig: {
          separator: ','
        },
        flexGrow: 1,
        sortable: true,
        hidden: true
      }
    ],
    sorters: [
      {
        dir: 'asc',
        prop: 'name'
      }
    ],
    store: {
      proxy: {
        service: 'Homecloud',
        get: {
          method: 'getUserList'
        }
      }
    },
    actions: [
      {
        type: 'menu',
        icon: 'add',
        tooltip: gettext('Create | Import'),
        actions: [
          {
            template: 'create',
            execute: {
              type: 'url',
              url: '/setupwizard/apps/drive/users/create'
            }
          }
        ]
      },
      {
        template: 'edit',
        execute: {
          type: 'url',
          url: '/setupwizard/apps/drive/users/edit/{{ _selected[0].name }}'
        }
      },
      {
        template: 'delete',
        confirmationDialogConfig:{
          template: 'confirmation-danger',
          message: gettext(
            'This will permanently DELETE user data in Drive. Do you want to continue?'
          )
        },
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'deleteUser',
            params: {
              name: '{{ name }}'
            }
          }
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
}
