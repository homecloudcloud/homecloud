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
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';


@Component({
  selector:'omv-urbackup-cleanup-page',
  template: `
  <div id="urbackup-cleanup-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-form-page id="urbackup-cleanup-form2" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./urbackup-cleanup-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})



export class AppsUrbackupCleanupComponent extends BaseFormPageComponent {
  private urbackupStatus: string = '';
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = '';

  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getUrbackupServiceStatus'
      }
    },
    fields: [
      {
        type: 'checkbox',
        name: 'cleanupConfirmation',
        label: gettext('Yes, I want to run cleanup'),
        hint: gettext('By checking this box, you agree to run the cleanup process'),
        value: false,
        readonly: false
      }
    ],
    buttons: [
      {
        template: 'submit',
        text: 'Cleanup UrBackup',
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Cleanup UrBackup'),
              autoScroll: true,
              startOnInit: true,
              buttons: {
                start: {
                  hidden: true
                },
                stop: {
                  hidden: true
                },
                close: {
                  hidden: false,
                  disabled: false,
                  autofocus: false,
                  dialogResult: true
                }
              },
              request: {
                service: 'Homecloud',
                method: 'urbackup_cleanup'
              }
            },
            successUrl: '/startconfiguration/apps/urbackup/access'
          }
        }
      }
    ]
  };


  constructor(private sanitizer: DomSanitizer, private rpcService: RpcService) {
    super();
  }
  
  ngOnInit(){
    this.fetchStatusAndUpdateFields();
  }

  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getUrbackupServiceStatus').subscribe(response => {
      this.urbackupStatus = response.status;

      this.htmlContent = `
        <div>
          <h1>Force Cleanup of Removed Clients Immediately</h1>
          <div class="status-field ${this.urbackupStatus !== 'Running' ? '' : 'hidden'}">
            <label>Urbackup backend service status:</label>
            <span class="status-value ${this.urbackupStatus !== 'Running' ? 'status-error' : 'status-success'}">${this.urbackupStatus}</span>
          </div>
          <div class="status-message ${this.urbackupStatus !== 'Running' ? '' : 'hidden'}">
            <span class="status-deploy-message ${this.urbackupStatus !== 'Not deployed' ? 'hidden' : ''}" >App is not deployed. Go to <a class="plainLink" href="#/startconfiguration/apps/urbackup">urbackup main page</a> to deploy the app. </span>
            <span class="status-not-running-message ${this.urbackupStatus !== 'Running' && this.urbackupStatus !== 'Not deployed' ? '' : 'hidden'}" >App is not running currently. Go to <a class="plainLink" href="#/startconfiguration/apps/urbackup/restart">urbackup status page</a> to check the status or restart the app. </span>
          </div>
        </div>
      `;
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
      this.updateButtonVisibility(this.urbackupStatus);
    });
  }

  updateButtonVisibility(status: string): void {
    setTimeout(() => {
      const cleanupForm = document.querySelector('omv-urbackup-cleanup-page #urbackup-cleanup-form2');
      const checkbox = document.querySelector('omv-urbackup-cleanup-page #urbackup-cleanup-form2 omv-form-checkbox');
      
      if (status === 'Running') {
        cleanupForm?.classList.remove('hidden');
        checkbox?.classList.remove('hidden');
        this.checkboxListener();
      } else {
        cleanupForm?.classList.add('hidden');
      }
    }, 500);
  }

  checkboxListener(): void {
    const checkbox = document.querySelector('omv-urbackup-cleanup-page #urbackup-cleanup-form2 omv-form-checkbox mat-checkbox');
    const cleanupButton = document.querySelector('omv-urbackup-cleanup-page #urbackup-cleanup-form2 omv-submit-button button');
    
    checkbox?.addEventListener('click', () => {
      setTimeout(() => {
        const isChecked = checkbox.classList.contains('mat-checkbox-checked');
        if (isChecked) {
          cleanupButton?.classList.remove('mat-button-disabled');
        } else {
          cleanupButton?.classList.add('mat-button-disabled');
        }
      }, 0);
    });
  }
 
 
  
}

 