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
//import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer,SafeHtml} from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';




@Component({
  selector:'omv-photos-external-storage-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <div id="photos-external-storage-form">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  
  `,
  styleUrls: ['./photos-external-storage-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosExternalStorageComponent extends BaseFormPageComponent {
  private hostname: string = '';
  private immichStatus: string = '';
  public safeHtmlContent:SafeHtml;
  private htmlContent='';

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
  
      this.updateHtml();
      
    
    });
  }

  updateHtml(): void {
    this.htmlContent = `<div class="container">
                            <h1>📸 Access Your USB Photos with Immich!</h1>
                            <p>🔌 Plug in your USB drive to Homecloud and go to the <a href="#/startconfiguration/usb-disks/filesystems" class="plainLink"><strong>Filesystems</strong></a> page to check if it's recognized.</p>
                            <p>🖥️ Open the <a class="app-btn ${this.immichStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}/admin/library-management" target="_blank"><strong>Immich web app</strong></a> and login as an admin user.<br>
                            <span class="status-error ${this.immichStatus !== 'Running' ? '' : 'hidden'}" >Immich is not running! Go to <a href="#/startconfiguration/apps/photos/restart" class="plainLink"><strong>photos status page</strong></a> to check the status or restart the app</span></p>
                            👉 Need admin info? Check <a class="plainLink" href="/#/startconfiguration/apps/photos/password">Passwords</a></p>

                            <h2>📁 Create a Library for USB Photos</h2>
                            <ol>
                              <li>Click <strong>Create Library</strong></li><br>
                              <li>Select the 📷 user who owns these photos</li><br>
                              <li>In the <strong>Add Import Path</strong> box, paste:
                                <code>/external-storage/</code>
                              </li><br>
                              <li>Click <strong>Add</strong>, then <strong>Validate</strong> ✅ and <strong>Save</strong> 💾</li><br>
                              <li>Click the 3 dots ••• and select <strong>Scan</strong> 🔍</li><br>
                            </ol>

                            <p>⏳ It may take a while depending on how many photos you have — could be hours or even days!</p>

                            <p>🧠 <em>Note: Immich doesn’t move your files — it just indexes and creates thumbnails, using a bit of Homecloud’s internal storage.</em></p>
                        </div>`;
    //Sanitize the HTML content
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }
  


  
}
