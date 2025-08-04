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
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';

@Component({
  selector:'omv-paperless-restore-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  // <omv-intuition-form-page id="paperless-restore-form1" [config]="this.config"></omv-intuition-form-page>
  template: `
  <div id="paperless-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-datatable-page id="paperless-restore-data-form" [config]="this.config1"></omv-intuition-datatable-page>
  `,
  styleUrls: ['./paperless-restore-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation  
})

export class AppsPaperlessRestoreComponent extends BaseFormPageComponent {

  private freeSpace:number=0.0;

  public safeHtmlContent: SafeHtml;
  
  private htmlContent ='';

  public config1: DatatablePageConfig = {
  
    stateId: '32z2n8aa-8ujg-13ea-0324-s4epl2ad2f79',
    autoReload: false,
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
            app:'paperless-ngx'
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
        name: gettext('Version'),
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
              operator: 'lt',
              arg0: { prop: 'size' },
              arg1: this.freeSpace
            }
          ]
    
        },
      
          confirmationDialogConfig: {
          template: 'confirmation',
          message: gettext(
            'Backup will OVERWRITE the existing configuration including users and all their stored documents. Only Documents and users that are in the backup would be available.'
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
                method: 'paperless_restore_execute',
                params:{
                  mount_path: '{{ _selected[0].mount_path}}'
                }

              }
            },
          successUrl:'/startconfiguration/apps/paperless'
          }
        }
      },
      {
        type: 'iconButton',
        text: gettext('Delete'),
        icon: 'mdi:delete',
        tooltip: gettext('Delete selected backup.'),
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1
        },
      
          confirmationDialogConfig: {
          template: 'confirmation',
          message: gettext(
            'This will permanently DELETE selected backup. You want to continue?'
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
                method: 'deleteBackup',
                params:{
                  mount_path: '{{ _selected[0].mount_path}}'
                }

              }
            },
          successUrl:'/startconfiguration/apps/paperless'
          }
        }
      }
    ]
  };
 
  ngOnInit(): void {
    this.rpcService.request('Homecloud', 'get_free_space_internaldisk', {}).subscribe((data: any) => {
      this.freeSpace = Number(data.free_space);  // Make sure totalGb is a number
      this.config1.actions[0].enabledConstraints.constraint[0].arg1 = this.freeSpace; // Update the constraint with the totalGb value
      this.htmlContent= `
            <div class="restore-container">
              <h1 class="restore-heading">
                ♻️ Restore Your Data from Backup
              </h1>

              <div class="restore-box">
                <p class="icon-text">
                  🖴 To get your data back from an earlier backup, plug in your USB drives to ☁️ Homecloud.
                </p>

                <p>
                  If the drive contains valid backups for this app, you'll see them listed in the table below.
                </p>

                <p class="icon-text">
                  ☁️ Homecloud needs enough free space to restore. The <strong>Restore</strong> button will stay disabled until there's enough space available.
                </p>

                <p class="icon-text warning">
                  ⚠️ <strong>Warning:</strong> Restoring will completely erase your current app setup — including all users and their data. Everything will be replaced with what's in the backup, including the app version.
                </p>

                <p>
                  It's recommended to back up your current app setup before starting the restore. This ensures your existing data is preserved in case the restore fails.
                </p>
                <p class="icon-text">
                  📦 <strong class="freespaceSizeText">Homecloud free space available(in GB):</strong><span class="freespaceSize">${this.freeSpace}</span>
                </p>

                <p class="info-text">
                  The table below shows all backups found on connected USB drives.
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
