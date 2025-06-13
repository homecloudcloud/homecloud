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
//import { DomSanitizer } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';

@Component({
  selector:'omv-photos-restore-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  // <omv-intuition-form-page id="photos-restore-form1" [config]="this.config"></omv-intuition-form-page>
  template: `
  <omv-intuition-form-page id="photos-restore-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-datatable-page id="photos-restore-data-form" [config]="this.config1"></omv-intuition-datatable-page>
  `,
  styleUrls: ['./photos-restore-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosRestoreComponent extends BaseFormPageComponent {

  private totalGb:string='0.0';

  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'get_free_space_internaldisk'

      }
    },
    fields: [
      
      {
        type: 'paragraph',
        title: gettext('Restore backup of Immich photos and videos from external USB disks. Plug-in external disks that contain Immich backup')
      },
      {
        type: 'textInput',
        name: 'free_space',
        label: gettext('Homecloud free space available in GB'),
        hint: gettext('Available free space should be greater than backup size to complete restore.'),
        value: '',
        readonly: true
      }
    ]
  };



  public config1: DatatablePageConfig = {
  
    stateId: '63a9d3ca-2fee-11ea-9065-e3epl1sd8f79',
    autoReload: 10000,
    remoteSorting: true,
    remotePaging: true,
    sorters: [
      {
        dir: 'asc',
        prop: 'timestamp'
      }
    ],
    store: {
      proxy: {
        service: 'Homecloud',
        get: {
          method: 'restore_find_backupsBg',
          task: true,
          params:{
            app:'immich'
          }
        }
      }
    },
    rowId: 'name',
    columns: [
      {
        name: gettext('Backup_size GB'),
        prop: 'size',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Immich_version'),
        prop: 'version',
        sortable: true,
        flexGrow: 1
      },
      {
        name: gettext('Disk'),
        prop: 'disk',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('DateTime'),
        prop: 'timestamp',
        flexGrow: 1,
        sortable: true
      }
    ],
    actions: [
      {
        type: 'iconButton',
        text: gettext('Restore'),
        icon: 'mdi:play',
        tooltip: gettext('Start restore from selected backup.'),
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1,
          constraint: [
            {
              operator: 'gt',
              arg0: {
                value: this.totalGb
              },
              arg1: {
                
              //    prop: '_selected[0].available'
                value: '{{_selected[0].available}}'
              }
              
              
            }
          ]
    
        },
      
          confirmationDialogConfig: {
          template: 'confirmation',
          message: gettext(
            'Backup will OVERWRITE the existing configuration including users and all the media files including photos and videos. Only photos,videos that are in the backup would be available. Existing media files on Homecloud would be removed.'
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
                method: 'immich_restore_execute',
                params:{
                  mount_path: '{{ _selected[0].mount_path}}'
                }

              }
            },
          successUrl:'/startconfiguration/apps/photos/access'
          }
        }
      },
    ]
  };
 
  ngOnInit(): void {
    this.rpcService.request('Homecloud', 'get_free_space_internaldisk', {}).subscribe((data: any) => {
      this.totalGb = data.free_space;
      console.log(this.totalGb);
      
    });
  }
  
 constructor(private rpcService: RpcService) {
    super();

 }

}
