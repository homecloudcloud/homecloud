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
import { Component, OnInit } from '@angular/core';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { MkfsConfig, MkfsConfigService } from '~/app/core/services/mkfs-config.service';
import { Unsubscribe } from '~/app/decorators';
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector:'omv-filesystem-main-page',
  template: `
  <div id="filesystem-main-form-1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-datatable-page [config]="this.config"></omv-intuition-datatable-page>
  <div id="filesystem-main-form-2">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
  </div>
  `,
  styleUrls: ['./filesystem-datatable-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class FilesystemDatatablePageComponent implements OnInit {
  @Unsubscribe()
  private subscriptions: Subscription = new Subscription();
  public safeHtmlContent: SafeHtml;
  public safeHtmlContent1: SafeHtml;
  private htmlContent =`
      <div class="usb-guide">
        <h1>🖴 USB Drive Setup</h2>

        <p>☁️ Data is stored in USB drives using one or more <strong>file systems</strong>.</p>

        <p>✅ If your drive is ready and properly configured, its file systems will appear in the table below.</p>

        <p>❌ Not seeing any file systems? Try using the <strong>Mount</strong> button below to load them manually.</p>

        <p>🆕 Got a new USB drive? Use the <strong>Add</strong> button to format it and create a new file system.</p>
        <p>☁️ Homecloud supports file systems from Windows, macOS, DOS, and Linux — so most drives will work just fine.</p>
      </div>
    `;
  private htmlContent1 =`
      <div class="usb-access">
        <h2>📂 Access Your Files</h3>
        <p>Go to the <a class="plainLink" href="#/startconfiguration/apps/drive/shares"><strong>Drive > Shares page</strong></a> to manage which drives are shared and set user permissions.</p>
        <h2>🖼️ Photo Access via Immich</h3>
        <p>If your USB drive has photos or videos you'd like to view in the <strong>Immich photo app</strong>, go to the <a class="plainLink" href="#/startconfiguration/apps/photos/external-storage"><strong>Immich USB page</strong></a> to configure it.</p>
      </div>
    `;

  public config: DatatablePageConfig = {
    stateId: '66d9d2ce-2fee-11ea-8386-e3eba0da8g78',
    autoReload: 90000,
    remoteSorting: true,
    remotePaging: true,
    sorters: [
      {
        dir: 'asc',
        prop: 'canonicaldevicefile'
      }
    ],
    store: {
      proxy: {
        service: 'Homecloud',
        get: {
          method: 'getUSBFileSystemsListBg',
          task: true
        }
      }
    },
    rowId: 'devicefile',
    columns: [
      {
        name: gettext('Device'),
        prop: 'canonicaldevicefile',
        flexGrow: 1,
        sortable: true,
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
        hidden: true,
        sortable: true
      },
      {
        name: gettext('Device(s)'),
        prop: 'devicefiles',
        flexGrow: 2,
        sortable: false,
        hidden: true,
        cellTemplateName: 'unsortedList'
      },
      {
        name: gettext('Identify As'),
        prop: '',
        flexGrow: 1,
        cellTemplateName: 'template',
        hidden: true,
        cellTemplateConfig: '{% if uuid %}UUID={{ uuid }}{% else %}{{ devicefile }}{% endif %}'
      },
      {
        name: gettext('Label'),
        prop: 'label',
        flexGrow: 1,
        sortable: true,
        hidden: true
      },
      {
        name: gettext('Parent Device'),
        prop: 'parentdevicefile',
        flexGrow: 1,
        sortable: true,
        hidden: true
      },
      {
        name: gettext('Filesystem'),
        prop: 'type',
        flexGrow: 1,
        sortable: true,
        hidden: true,
        cellTemplateName: 'chip',
        cellTemplateConfig: {
          template: '{{ type | upper }}'
        }
      },
      {
        name: gettext('Total'),
        prop: 'size',
        flexGrow: 1,
        sortable: true,
        hidden: true,
        cellTemplateName: 'template',
        cellTemplateConfig: '{{ size | tobytes | binaryunit | notavailable("-") }}'
      },
      {
        name: gettext('Available'),
        prop: 'available',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'template',
        cellTemplateConfig: '{{ available | tobytes | binaryunit | notavailable("-") }}'
      },
      {
        name: gettext('Used'),
        prop: 'percentage',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'progressBar',
        cellTemplateConfig: {
          text: '{{ used | tobytes | binaryunit | notavailable("-") }}',
          warningThreshold: '{{ usagewarnthreshold | default(0) }}'
        }
      },
      {
        name: gettext('Mounted'),
        prop: 'mounted',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'checkIcon'
      },
      {
        name: gettext('Mount Point'),
        prop: 'mountpoint',
        flexGrow: 1,
        sortable: true,
        hidden: true,
        cellTemplateName: 'copyToClipboard'
      },
      {
        name: gettext('Mount Options'),
        prop: 'mountopts',
        flexGrow: 1,
        sortable: false,
        hidden: true,
        cellTemplateName: 'template',
        cellTemplateConfig: '{{ mountopts | split(",") | map("strip") | join(", ") }}'
      },
      {
        name: gettext('Accessible via Drive'),
        prop: '_used',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'checkIcon'
      },
      {
        name: gettext('Status'),
        prop: 'status',
        flexGrow: 1,
        sortable: true,
        cellTemplateName: 'chip',
        cellTemplateConfig: {
          map: {
            /* eslint-disable @typescript-eslint/naming-convention */
            1: { value: gettext('Online'), class: 'omv-background-color-pair-success' },
            2: { value: gettext('Initializing'), class: 'omv-background-color-pair-info' },
            3: { value: gettext('Missing'), class: 'omv-background-color-pair-error' }
            /* eslint-enable @typescript-eslint/naming-convention */
          }
        }
      }
    ],
    actions: [
      {
        type: 'iconButton',
        text: gettext('Mount'),
        icon: 'mount',
        tooltip: gettext('Mount an existing file system.'),
        execute: {
          type: 'url',
          url: '/startconfiguration/usb-disks/filesystems/mount'
        }
      },
      {
        type: 'menu',
        icon: 'add',
        tooltip: gettext('Create and mount a file system.'),
        actions: []
      },
      {
        template: 'edit',
        enabledConstraints: {
          minSelected: 1,
          maxSelected: 1,
          constraint: [
            // Enable button if the file system has a `/etc/fstab` entry.
            // This is because monitoring the warning threshold is only
            // possible for mounted file systems.
            { operator: 'truthy', arg0: { prop: 'propfstab' } }
          ]
        },
        execute: {
          type: 'url',
          url: '/startconfiguration/usb-disks/filesystems/edit/{{ _selected[0].canonicaldevicefile | encodeuricomponent }}'
        }
      },
      {
        template: 'delete',
        icon: 'stop',
        tooltip: gettext('Unmount'),
        enabledConstraints: {
          constraint: [
            // Disable button if file system is in use or read-only.
            {
              operator: 'if',
              arg0: { operator: 'has', arg0: { prop: '_used' } },
              arg1: { operator: 'falsy', arg0: { prop: '_used' } }
            },
            {
              operator: 'if',
              arg0: { operator: 'has', arg0: { prop: '_readonly' } },
              arg1: { operator: 'falsy', arg0: { prop: '_readonly' } }
            },
            // Disable button if file system is initialized (status=2)
            // at the moment.
            { operator: 'ne', arg0: { prop: 'status' }, arg1: 2 },
            // Enable button if file system supports fstab
            // mount entries.
            { operator: 'truthy', arg0: { prop: 'propfstab' } }
          ]
        },
        confirmationDialogConfig: {
          title: gettext('Unmount'),
          message: gettext(
            // eslint-disable-next-line max-len
            'Do you really want to unmount this file system? Please make sure that the file system is not used by any service before unmounting. Note, the file system will not be deleted by this action.'
          )
        },
        execute: {
          type: 'request',
          request: {
            service: 'FileSystemMgmt',
            method: 'umount',
            params: {
              id: '{{ devicefile }}',
              fstab: true
            },
            progressMessage: gettext('Please wait, unmounting the file system ...')
          }
        }
      }
    ]
  };

 
  constructor(private mkfsConfigService: MkfsConfigService,private sanitizer:DomSanitizer) {
    //Sanitize html
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
      this.safeHtmlContent1 = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent1);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.mkfsConfigService.configs$.subscribe((configs: MkfsConfig[]) => {
        // @ts-ignore
        this.config.actions[1].actions = _.chain(configs)
          .sortBy(['text'])
          .map((config) => ({
            type: 'button',
            text: config.text,
            execute: {
              type: 'url',
              url: config.url
            }
          }))
          .value();
      })
    );
  }
}
