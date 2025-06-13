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
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-drive-backup-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="drive-backup-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-datatable-page id="drive-backup-data-form" [config]="this.config1"></omv-intuition-datatable-page>

  `,
  styleUrls: ['./drive-backup-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsDriveBackupComponent extends BaseFormPageComponent {

  private totalGb:number=0.0;

  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'get_backup_size_drive'
      }
    },
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Backup your Drive files to external USB disks plugged in to Homecloud. This includes files of all users stored on Drive.')
      },
      {
        type: 'paragraph',
        title: gettext('Insert image paperless-backup-1.png')
      },
      {
        type: 'textInput',
        name: 'total_gb',
        label: gettext('Estimated Drive backup size in GB'),
        hint: gettext('This is estimated free disk capacity required on external USB disk for completing backup'),
        value: '',
        readonly: true
      }
    ]
  };

  public config1: DatatablePageConfig = {
  
    stateId: '67d4d3ca-6dsp-25ea-5142-e3ebl1cd8f55',
    autoReload: 10000,
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
          method: 'get_external_disksBg',
          task: true
        }
      }
    },
    rowId: 'name',
    columns: [
      {
        name: gettext('External Disk'),
        prop: 'name',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Capacity (GB)'),
        prop: 'capacity',
        sortable: true,
        flexGrow: 1
      },
      {
        name: gettext('Available (GB)'),
        prop: 'available',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Filesystem'),
        prop: 'filesystem',
        flexGrow: 1,
        sortable: true,
      
      }
    ],
    actions: [
      {
        type: 'iconButton',
        text: gettext('Backup'),
        icon: 'mdi:play',
        tooltip: gettext('Start backup to selected disk.'),
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1,
          constraint: [
            {
              operator: 'gt',
              arg0: { prop: 'available' },
              arg1: this.totalGb
            }
          ]
    
        },
      
          confirmationDialogConfig: {
          template: 'confirmation',
          message: gettext(
            'Backup will be stored in folder named drive_backups_timestamp under homecloud_backups in selected backup disk. Do you want to continue? Backup would be incremental - only files changed since last backup would be copied. Files will never be deleted in backup'
          )
        },
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Message'),
              autoScroll: false,
              startOnInit: true,
              buttons: {
                start: {
                  hidden: true
                },
                stop: {
                  hidden: true
                },
                close:{
                  hidden: false,
                  disabled: false,
                  autofocus: false,
                  dialogResult: true
                }

              },
              request: {
                service: 'Homecloud',
                method: 'drive_backup_execute',
                params:{
                  mount_path: '{{ _selected[0].mount_path}}'
                }

              }
            },
          successUrl:'/startconfiguration/apps/drive'
          }
        }
      },
    ]
  };
 
  ngOnInit(): void {
    this.rpcService.request('Homecloud', 'get_backup_size_drive', {}).subscribe((data: any) => {
      this.totalGb = data.total_gb;
      this.config1.actions[0].enabledConstraints.constraint[0].arg1 = this.totalGb; // Update the constraint with the totalGb value
      
    });
  }
  
  
  
  
 constructor(private rpcService: RpcService) {
    super();

 }

}
