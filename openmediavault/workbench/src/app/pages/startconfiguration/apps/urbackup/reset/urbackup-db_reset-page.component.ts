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





@Component({
  selector:'omv-urbackup-db_reset-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="urbackup-reset-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./urbackup-db_reset-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsUrBackupDBResetComponent extends BaseFormPageComponent {
 // public safeHtmlContent: SafeHtml;
  private htmlContent=`
  <div class="container">
    <h1>🧹 Reset UrBackup</h1>
    <p>
    Want a clean slate? Reset your <strong>UrBackup app</strong> and start fresh 🆕.
    </p>

    <div class="warning">
    ⚠️ <strong>WARNING:</strong><br />
        This will permanently <strong>DELETE all UrBackup backups, machines and their data</strong>, including:
        <ul>
          <li>🎞️ Backups taken</li>
          <li>🖼️ Configuration</li>
          <li>🧠 Configured clients</li>
        </ul>
        🚫 <strong>This cannot be undone!</strong>
    </div>

    <p class="backup-tip">💾 Please take an <strong>UrBackup data backup</strong> before continuing 🛡️</p>
    `;

  public config: FormPageConfig = {
    
    fields: [
      
      
      /*{
        type: 'paragraph',
        title: gettext('Reset UrBackup App to fresh state')
      },
      {
        type: 'paragraph',
        title: gettext('IMPORTANT: This will delete all the machine configuration and their backup data stored in UrBackup. This CANNOT be undone.')
      },
      {
        type: 'paragraph',
        title: gettext('Highly recommended to take UrBackup backup before proceeding further')
      }
      */
    ],
    buttons: [
      {
        text: gettext(`🔁 Reset UrBackup`),
        disabled:false,
        submit:true,
       // class:'omv-background-color-pair-primary',
        class:'red white',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'STOP! This action cannot be undone. Data is deleted permanently. Do you really want to proceed?'
        },
        execute: {
          type: 'request',
          request: {
            service: 'Homecloud',
            method: 'reset_urbackup',
            task: false, // Set to true if this is a long-running task
            progressMessage: 'Resetting UrBackup',
            successNotification: 'Deleted all UrBackup data',
            successUrl: '/startconfiguration/apps/urbackup'
          }
        }
      }
    ],
    buttonAlign: 'start' // You can adjust the alignment to 'start', 'center', or 'end'
  };


    constructor(private sanitizer: DomSanitizer) {
        super();
        //this.config.fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].title) as unknown as string;   
         
        this.config.fields = [
          {
            type: 'paragraph',
            title: this.htmlContent
          }
        ];
        // Sanitize the HTML content once during construction
        this.config.fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[0].title) as unknown as string;
        
        // Sanitize the HTML content once during construction
        

      
    }

    ngAfterViewInit() {
      setTimeout(() => {

        // Select all paragraph elements 
        const paragraphs = document.querySelectorAll('omv-urbackup-db_reset-page omv-form-paragraph .omv-form-paragraph');
     
        // Inject the sanitized HTML into the correct paragraph element       
        paragraphs[0].innerHTML =
        (this.config.fields[0].title as any).changingThisBreaksApplicationSecurity ||
        this.config.fields[0].title?.toString();
       
      }, 100);
  }


}
