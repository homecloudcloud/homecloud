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
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
@Component({
  selector:'omv-shared-folder-main-page',
  template: ` <div id="shared-folder-main-form-1">
                <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
              </div>
             <omv-intuition-datatable-page [config]="this.config"></omv-intuition-datatable-page>
             <div id="shared-folder-main-form-2">
                <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
              </div>`,
  styleUrls: ['./shared-folder-datatable-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class SharedFolderDatatablePageComponent {
  public safeHtmlContent: SafeHtml;
  public safeHtmlContent1: SafeHtml;
  private htmlContent =`
      <div class="shares-section">
        <h1>📁 Manage Your Shares</h1>

        <h2>What Are Shares?</h2>
        <p>📂 Shares are network folders that allow Drive users to store and share files.</p>
        <p>They can exist on internal Homecloud storage or connected USB drives.</p>
        <p>🔒 All shares are accessible only over <strong>VPN or local network</strong> for security.</p>
        <p>🔧 You can set individual permissions for each share right here.</p>
        <hr>
        <h2>How to manage them?</h3>
        <p>📁 The <strong>Drive app</strong> lets you share data over the network by creating <strong>Shares</strong>.</p>

        <p>👤 Each user <a class="plainLink" href="#/startconfiguration/apps/drive/users"><strong>on creation</strong></a> automatically gets a personal share, only accessible by them.</p>

        <p>👨‍👩‍👧‍👦 Want to share files with others? You can create <strong>common shares</strong> and assign permissions below to collaborate with other users.</p>
        
        <p>🖴 Shares for USB drives are created <strong>automatically</strong> when plugged in. If not, you can manually add them here.</p
      </div>
    `;
  private htmlContent1=`
      
      <div class="backup-section">
        <h2>🖥️ Backup from Your Computer</h2>
        <p>Want to use <strong>Apple Time Machine</strong> or <strong>Duplicati</strong> to back up your PC or Mac?</p>
        <ol>
          <li>Create a new share above.</li>
          <li>Assign permission to the correct user.</li>
          <li>Go to the <a class="plainLink" href="#/startconfiguration/apps/drive/access"><strong>Access page</strong></a> to configure the share on your Mac or PC.</li>
          <li>Open Time Machine or Duplicati to start back up on the configured network share.</li>
        </ol>
      </div>
    `;
  public config: DatatablePageConfig = {
    stateId: 'c0a05d92-2d72-11ea-9b29-33dda9c523cc',
    autoReload: false,
    hasSearchField: true,
    remoteSorting: true,
    remotePaging: true,
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
          method: 'getSharedFoldersListFilterHomedirs'
        }
      },
      transform: {
        absdirpath: '/{{ [mntent.dir, reldirpath] | map("strip", "/")  | compact() | join("/") }}'
      }
    },
    rowEnumFmt: '{{ name }}',
    columns: [
      {
        name: gettext('Share'),
        prop: 'name',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Disk'),
        prop: 'device',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Relative Path'),
        prop: 'reldirpath',
        flexGrow: 1,
        sortable: true,
        hidden: true
      },
      {
        name: gettext('Absolute Path'),
        prop: 'absdirpath',
        flexGrow: 2,
        sortable: true,
        cellTemplateName: 'copyToClipboard',
        hidden: true
      },
      {
        name: gettext('Referenced'),
        prop: '_used',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'checkIcon',
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
        sortable: true
      }
    ],
    actions: [
      {
        template: 'create',
        execute: {
          type: 'url',
          url: '/startconfiguration/apps/drive/shares/create'
        }
      },
      {
        template: 'edit',
        execute: {
          type: 'url',
          url: '/startconfiguration/apps/drive/shares/edit/{{ _selected[0].uuid }}'
        }
      },
      {
        type: 'iconButton',
        icon: 'mdi:folder-key',
        tooltip: gettext('Permissions'),
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1
        },
        execute: {
          type: 'url',
          url: '/startconfiguration/apps/drive/shares/permissions/{{ _selected[0].uuid }}'
        }
      },
      {
        template: 'delete',
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'deleteShareandSMB',
            params: {
              uuid: '{{ uuid }}',
              recursive: false
            }
          }
        }
      }
    ]
  };
  constructor(private sanitizer:DomSanitizer) {
      //Sanitize html
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
        this.safeHtmlContent1 = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent1);
     
    }
}
