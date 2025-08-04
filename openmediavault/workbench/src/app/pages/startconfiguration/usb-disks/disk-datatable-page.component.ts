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
//import { Router } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';

import { DatatablePageActionConfig } from '~/app/core/components/intuition/models/datatable-page-action-config.type';
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { format } from '~/app/functions.helper';
import { ModalDialogComponent } from '~/app/shared/components/modal-dialog/modal-dialog.component';
import { TaskDialogComponent } from '~/app/shared/components/task-dialog/task-dialog.component';
import { Datatable } from '~/app/shared/models/datatable.interface';
import { DialogService } from '~/app/shared/services/dialog.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';

@Component({
   selector:'omv-usb-disk-main-page',
  template: `
  <div id="usb-disk-main-form-1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-datatable-page [config]="this.config"></omv-intuition-datatable-page>
  <omv-navigation-page></omv-navigation-page>>
  
  `,
  styleUrls: ['./disk-datatable-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiskDatatablePageComponent {
  public safeHtmlContent: SafeHtml;
  private htmlContent =`
    <div class="usb-info">
        <h1>🖴 Access USB Drives from Homecloud</h1>

        <p>🔌 Simply plug your USB drives into Homecloud to access them over your network.</p>

        <p>🔢 You can connect <strong>up to 4 USB drives</strong>:</p>
        <ul>
        <li>2 × USB 2.0 ports</li>
        <li>2 × USB 3.0 (blue) high-speed ports</li>
        </ul>
        <img src="assets/images/usb-ports.png" alt="USB Ports" class="usb-ports-image">
        <p>⚠️ Please check your USB drive compatibility and plug it into the appropriate port.</p>

        <p>📂 After connecting, your drives will appear in the table below. Visit the <a class="plainLink" href="#/startconfiguration/usb-disks/filesystems"><strong>Filesystems page</strong></a> to verify that the drive is detected and ready to use.</p>
        <p>❗ Before unplugging a drive, always use the <strong>Safe Remove</strong> option to prevent data loss.</p>
  </div>
  `;
  public config: DatatablePageConfig = {
    stateId: 'c2d59665-d12a-4166-91fc-bdf4707ee539',
    autoReload: false,
    remoteSorting: true,
    remotePaging: true,
    sorters: [
      {
        dir: 'asc',
        prop: 'canonicaldevicefile'
      }
    ],
    columns: [
      { name: gettext('Device'), prop: 'canonicaldevicefile', flexGrow: 1, sortable: true, hidden: true },
      {
        name: gettext('Device Symlinks'),
        prop: 'devicelinks',
        flexGrow: 2,
        sortable: false,
        hidden: true,
        cellTemplateName: 'unsortedList'
      },
      {
        name: gettext('Model'),
        prop: 'model',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Serial Number'),
        prop: 'serialnumber',
        flexGrow: 1,
        hidden: true,
        sortable: true
      },
      {
        name: gettext('WWN'),
        prop: 'wwn',
        flexGrow: 1,
        sortable: true,
        hidden: true
      },
      {
        name: gettext('Vendor'),
        prop: 'vendor',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('Capacity'),
        prop: 'size',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'binaryUnit'
      },
      {
        name: gettext('In Use'),
        prop: '_used',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'checkIcon'
      },
    ],
    store: {
      proxy: {
        service: 'Homecloud',
        get: {
          method: 'getExternalDisksListBg',
          task: true
        }
      }
    },
    actions: [
      /*
      {
        template: 'edit',
        click: this.onEdit.bind(this)
      },
      */
      {
        type: 'iconButton',
        icon: 'eraser',
        tooltip: gettext('Wipe'),
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1,
          constraint: [
            {
              operator: 'and',
              arg0: { operator: 'falsy', arg0: { prop: 'isroot' } },
              arg1: { operator: 'falsy', arg0: { prop: 'isreadonly' } }
            }
          ]
        },
        click: this.onWipe.bind(this)
      },
      {
        type: 'iconButton',
        icon: 'search',
        tooltip: gettext('Scan for new devices'),
        confirmationDialogConfig: {
          template: 'confirmation',
          message: gettext(
            // eslint-disable-next-line max-len
            'It may take a while to detect the new devices, thus it might be necessary to reload the table several times. Do you want to proceed?'
          )
        },
        execute: {
          type: 'request',
          request: {
            service: 'DiskMgmt',
            method: 'rescan',
            progressMessage: gettext('Scanning for new devices ...')
          }
        }
      },
      {
        template: 'delete',
        icon: 'stop',
        tooltip: gettext('Safely Remove'),
        enabledConstraints: {
          constraint: [
            // Disable button if file system is in use or read-only.
            { operator: 'truthy', arg0: { prop: '_used' } }
          ]
        },
        confirmationDialogConfig: {
          title: gettext('Remove'),
          message: gettext(
            // eslint-disable-next-line max-len
            'Any applications, users connected to this USB drive will be disconnected. Are you sure you want to continue removing disk?'
          )
        },
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'ejectDisk',
            params: {
              devicefile: '{{ canonicaldevicefile }}'
            },
            progressMessage: gettext('Please wait, removing the disk...')
          }
        }
      }
    ]
  };

 
  //constructor(private dialogService: DialogService, private router: Router) {}
  constructor(private dialogService: DialogService, private sanitizer:DomSanitizer) {
    //Sanitize html
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }
  /*
  onEdit(action: DatatablePageActionConfig, table: Datatable) {
    const selected = table.selection.first();
    let url: string;
    if (isUUID(_.get(selected, 'hdparm.uuid'))) {
      url = '/storage/disks/hdparm/edit/{{ hdparm.uuid }}';
    } else {
      url = '/storage/disks/hdparm/create/{{ devicefile | encodeuricomponent }}';
    }
    this.router.navigate([format(url, selected)]);
  }
  */

  onWipe(action: DatatablePageActionConfig, table: Datatable) {
    const selected = table.selection.first();
    this.dialogService
      .open(ModalDialogComponent, {
        data: {
          template: 'confirmation-critical',
          title: gettext('Erase Disk'),
          message: format(
            gettext(
              'Do you really want to erase the device {{ canonicaldevicefile }}? All data will be lost forever.'
            ),
            selected
          )
        }
      })
      .afterClosed()
      .subscribe((choice: boolean) => {
        if (choice) {
          this.dialogService
            .open(ModalDialogComponent, {
              data: {
                template: 'confirmation',
                title: gettext('Wipe'),
                message: gettext('Please choose the method to erase the device.'),
                buttons: [
                  {
                    text: gettext('Cancel'),
                    dialogResult: false,
                    autofocus: true
                  },
                  {
                    text: gettext('Quick'),
                    dialogResult: 'quick',
                    class: 'omv-background-color-pair-red'
                  },
                  {
                    text: gettext('Secure'),
                    dialogResult: 'secure',
                    class: 'omv-background-color-pair-red'
                  }
                ]
              }
            })
            .afterClosed()
            .subscribe((mode: boolean | string) => {
              if (mode) {
                this.dialogService.open(TaskDialogComponent, {
                  width: '75%',
                  data: {
                    title: gettext('Erasing device'),
                    startOnInit: true,
                    request: {
                      service: 'DiskMgmt',
                      method: 'wipe',
                      params: {
                        devicefile: selected.devicefile,
                        secure: mode === 'secure'
                      }
                    }
                  }
                });
              }
            });
        }
      });
  }
}
