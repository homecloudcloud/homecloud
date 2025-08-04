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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'omv-setupwizard-drive-user-datatable-page',
  template: `<omv-logo-header></omv-logo-header>
              <div id="mainContainer">
                  <div id="drive-users-form1">
                    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
                  </div>
                  <omv-intuition-datatable-page [config]="this.config"></omv-intuition-datatable-page>
              </div>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,
             styleUrls: ['./user-page.component.scss'],
             
             encapsulation: ViewEncapsulation.None
})
export class UserDatatablePageComponent {
   public safeHtmlContent:SafeHtml
  private htmlContent=`<div class="container">
                      <h1>👥Manage users for Drive access below</h1>
                      <p>🗂️ Each user gets a <strong>private Drive share</strong> upon creation — only they can access it.</p>
                      <p>⚙️ You can <strong>create, update, or delete users and update their passwords</strong> directly in the table.</p>
                      <p>🚀 Once your account is ready, head over to the <a href="#/setupwizard/apps/drive/access" class="plainLink"><strong>Access page</strong></a> to connect and start using your Drive from your phone or computer 📱💻.</p>
                      </div>`;
  /*public config2: FormPageConfig = {
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
  */
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
      { name: gettext('Email'), prop: 'email', flexGrow: 1, sortable: true, hidden: true },
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
  constructor(private sanitizer:DomSanitizer){
    // Sanitize the HTML content 
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Drive Setup',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/drive'
        }
        
      },
      
      {template:'submit',
        text:'Next: Drive Access >',
        execute: {
          type: 'request',
          request:{
            service:'Homecloud',
            method:'checkDriveUserSetupForWizard',
            params:{"start":0,"limit":-1},
            task:false,
            progressMessage:gettext('Please wait, checking user setup for drive ...'),
            successNotification: gettext('User setup for Drive is complete.'),
            successUrl:'/setupwizard/apps/drive/access',
            
          }
        }
      },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip this step',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'If Users are not created, you will not be able to access Drive. Do you still want to skip?<b>Note:</b> You can also create users later from Homecloud Dashboard.'
        },
        
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'appsDriveUsers'
            },
            successUrl:'/setupwizard/apps/drive/access',
          }
        }
      }
    ]


  };
}
