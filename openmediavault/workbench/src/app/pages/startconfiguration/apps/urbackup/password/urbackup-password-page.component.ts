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
import { Component, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';

@Component({
  selector:'urbackup-main-page',
  template: `
  <div id="urbackup-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./urbackup-password-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AppsUrbackupPasswordResetComponent extends BaseFormPageComponent implements AfterViewInit {

  public safeHtmlContent: SafeHtml;

  private htmlContent = `<h1>UrBackup Password Reset</h1>
                          <p>
                            To update password of UrBackup server, enter UrBackup user id of which password need to be reset and press reset button. New password will be shown.
                          </p>
                          `;
  
  public config: FormPageConfig = {
    fields: [
      {
        type: 'textInput',
        name: 'username',
        label: gettext('UrBackup Username'),
        hint: gettext('Enter the username for password reset'),
        value: ''
      }
    ],
    buttons: [
      {
        template: 'submit',
        text: 'Reset Password',
        //disabled: true,
        confirmationDialogConfig: {
          template: 'confirmation',
          message: gettext(
            'Do you want to continue?'
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
                start: { hidden: true },
                stop: { hidden: true },
                close: {
                  hidden: false,
                  disabled: false,
                  autofocus: false,
                  dialogResult: true
                }
              },
              request: {
                service: 'Homecloud',
                method: 'urbackup_reset_password',
                params: {
                  user: '{{ username }}'
                }
              }
            },
            successUrl: '/startconfiguration/apps/urbackup/access'
          }
        }
      }
    ]
  };    
  
  
  constructor(private sanitizer: DomSanitizer) {
    super();
    // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }
  
  ngAfterViewInit(): void {
    // No need for manual DOM manipulation anymore
  }

}
