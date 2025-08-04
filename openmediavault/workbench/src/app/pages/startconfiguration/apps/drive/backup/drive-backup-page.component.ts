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
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { RpcService } from '~/app/shared/services/rpc.service';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';


@Component({
  selector:'omv-drive-backup-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <div id="drive-backup-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-datatable-page id="drive-backup-data-form" [config]="this.config1"></omv-intuition-datatable-page>

  `,
  styleUrls: ['./drive-backup-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsDriveBackupComponent extends BaseFormPageComponent {

  private totalGb:number=0.0;
  public safeHtmlContent: SafeHtml;
  
  private htmlContent ='';

  

  public config1: DatatablePageConfig = {
  
    stateId: '67d4d3ca-6dsp-25ea-5142-e3ebl1cd8f55',
    autoReload: false,
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
            },
            {
              operator: 'eq',
              arg0: { prop: 'filesystem' },
              arg1: 'ext4'
            }
          ]
    
        },
      
          confirmationDialogConfig: {
          template: 'confirmation',
          message: gettext(
            'Backup will be stored in folder under homecloud_backups in selected backup disk. Do you want to continue? Backup would be incremental - only files changed since last backup would be copied. Files will never be deleted in backup'
          )
        },
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Message'),
              autoScroll: true,
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
      this.htmlContent= `
            <div class="backup-container">
              <h1 class="backup-heading">
               🖴 Keep Your Data Safe with Backups
              </h1>
              <div class="backup-box">
                <p class="icon-text">
                ⚠️ It's a good idea to keep an extra copy of your data outside of <strong>Homecloud</strong>, just in case something goes wrong.
                </p>
                <p>
                You can plug in a USB drive with enough free space to store your files. Homecloud will save a full backup to a folder called <code>homecloud-backups</code> on that drive.
                </p>
                <p class="icon-text">
                🔄 Each time you run a backup, it makes incremental copy of your data (new or changed files since last backup are copied).
                </p>
                <p class="icon-text">
                🔓 Remember: backups are not encrypted. Make sure to keep your USB drive somewhere safe and private.
                </p>
                <p class="icon-text">
                  📦 <strong class="backupSizeText">Estimated Drive backup size(in GB):</strong><span class="backupSize">${this.totalGb}</span>
                </p>
                <p class="icon-text">
                  🖴 The table below shows the list of external disks currently connected and available for backup. Backup of Drive app is only supported on USB drives with EXT4 file systems. Go to Filesystems page to format USB drive with EXT4 filesystem.
                </p>                              
              </div>
            </div> 
  `;


      //Sanitize html
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    });
  }
  
  
  
  
 constructor(private rpcService: RpcService,private sanitizer:DomSanitizer) {
    super();

 }

}
