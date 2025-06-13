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

@Component({
  template: `<omv-intuition-form-page id="drive-shares"[config]="this.config2"></omv-intuition-form-page>
             <omv-intuition-datatable-page [config]="this.config"></omv-intuition-datatable-page>`
})
export class SharedFolderDatatablePageComponent {
  public config2: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext(`Shares are network accessible folders that are used for data sharing among Drive users. Shares can be created on Homecloud internal storage or plugged in USB disks. Shares are only accessible over VPN or local network.`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`Shares of Plugged in USB disks are automatically created. Individual user level permissions for shares can be assigned.`),
        name:'paragraph2'
      },

    ]
  };
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
}
