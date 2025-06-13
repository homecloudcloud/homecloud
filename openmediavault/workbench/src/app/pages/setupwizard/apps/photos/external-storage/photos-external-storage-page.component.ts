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
import { DomSanitizer } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';




@Component({
  selector:'omv-photos-external-storage-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="photos-external-storage-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-external-storage-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosExternalStorageComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private immichStatus: string = '';
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getImmichServiceStatus'
      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext('')
      },
      {
        type: 'paragraph',
        title: gettext('Your pictures on USB disks can be indexed and accessed via Immich. Immich only scans, indexes and creates thumbnails of media found on external disks. It does not move those files to Homecloud internal storage')
      },
      {
        type: 'paragraph',
        title: gettext('To enable indexing of media on USB disks, first plug-in those disks to USB slot of Homecloud')
      },
      {
        type: 'paragraph',
        title: gettext('Open Immich webapp login with user having Immich admin rights. To find Immich user with admin rights, go to <a href="/#/startconfiguration/apps/photos/password"> &nbsp;&nbsp; Passwords</a> ')
      },
      
      {
        type: 'paragraph',
        title: gettext('')
      },
      
      {
        type: 'paragraph',
        title: gettext('After login go to right top corner > User > Administration > External Libraries > Create Library')
      },
      {
        type: 'paragraph',
        title: gettext('Select the owner from listed Immich users who would access all the media in external USB storage. This user can share these photos with other users.')
      },
      {
        type: 'paragraph',
        title: gettext('After creating library, click the three dots on right side of the row and select > edit import paths.')
      },
      {
        type: 'paragraph',
        title: gettext('Select Add Path and paste the below string in Path > Add')
      },
      {
        type: 'textInput',
        name: 'path',
        label: gettext('External library path'),
        hint: gettext('Paste this in external library import path in Immich library settings'),
        value: '/external-storage/',
        readonly: true
      },
      {
        type: 'paragraph',
        title: gettext('')
      },

    ]
  };

  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();   
    
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getImmichServiceStatus').subscribe(response => {
      this.immichStatus = response.status;
      this.hostname = response.hostname; // Adjust based on API response structure
      console.log('immichstatus',this.immichStatus);
      console.log('hostname',this.hostname);

  

      //Update title with hostname
      this.config.fields[4].title=`Login to Immich webapp <a class="immich-btn" href="${this.hostname}" target="_blank"> &nbsp;&nbsp;Access Immich WebApp</a>`;
      
      
      // Sanitize the title 
      this.config.fields[4].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[4].title) as unknown as string;
      this.addSanitizedHtml();
    });
  }
  addSanitizedHtml(){
     // Select all paragraph elements (assuming they are rendered as `ios-drive-form1 omv-form-paragraph` elements)
     const paragraphs = document.querySelectorAll('#photos-external-storage-form1 .omv-form-paragraph');

     // Inject the sanitized HTML into the correct paragraph element
     paragraphs[4].innerHTML =
     (this.config.fields[4].title as any).changingThisBreaksApplicationSecurity ||
     this.config.fields[4].title?.toString();
     

  }


  
}
