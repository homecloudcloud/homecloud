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
import { Component, ViewEncapsulation } from '@angular/core';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { RpcService } from '~/app/shared/services/rpc.service';
import { FormPageButtonConfig } from '~/app/core/components/intuition/models/form-page-config.type';


@Component({
  selector:'omv-update-main-page',
  template: `
  <div id="update-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>

  <div id="update-main-form2">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent1"></div>
  </div>

  <omv-intuition-form-page id="omv-update-form1"[config]="this.config"></omv-intuition-form-page>
  

  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls:['./update-main-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})


export class UpdateMainPageComponent extends BaseFormPageComponent {
  private statustosend:string='';
  public safeHtmlContent1: SafeHtml;
  private buttonText:string='';

  public safeHtmlContent: SafeHtml;
  private htmlContent=`
    <h1>🔄 Manage Homecloud Updates</h1>
    <p>
    Stay up to date with the latest <strong>Homecloud software updates</strong> 🛠️ for improved performance, features, and security.
    </p>

    <div class="note">
    🔔 <strong>Note:</strong> This  manages updates for the <strong>Homecloud system only</strong>.App updates are handled individually through their own app pages 📦.
    </div>`;

  private htmlContent1= `

          <div class="auto-update-box">
            <h3>⚙️ Enable Auto Updates</h3>
            <p>Automatically keep Homecloud up to date with the latest releases.</p>
          </div> 
  `;
  private buttonConfig:FormPageButtonConfig= {
      text: this.buttonText,
      disabled: false,
      submit: true,
      class: 'omv-background-color-pair-primary',
      execute: {
        type: 'request',
        request: {
          service: 'Homecloud',
          method: 'systemAutoUpdates',
          params: {
            action: this.statustosend
          },
          task: false,
          progressMessage: 'Updating auto-update settings...',
          successNotification: 'Successfully updated auto-update settings',
          successUrl: '/system/updatemgmt/updates'
        }
      }
  };

  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'systemAutoUpdates',
        params: {
          action: 'status'
        }
      },
    },
    fields: [
      {
        type: 'textInput',
        name: 'status',
        label: 'Auto Updates Status',
        hint: 'Automatically keep your Homecloud system up to date with the latest releases.',
        value: '',
        readonly: true
      }
    ],
    buttons: [
  
    ]
  };


  constructor(private rpcService: RpcService, private sanitizer: DomSanitizer){
    super();
    //Sanitize html
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    this.safeHtmlContent1 = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent1);
  }

  ngOnInit():void{
    
    this.rpcService.request('Homecloud', 'systemAutoUpdates',{
      action: 'status'
    }).subscribe(response => {
      this.statustosend = response.status === 'enabled' ? 'disable' : 'enable';
      this.buttonText = response.status === 'enabled' ? 'Disable Auto updates' : 'Enable Auto updates';
      // Set the button config after we have the status
      this.buttonConfig.execute.request.params.action = this.statustosend;
      this.buttonConfig.text = this.buttonText;
      this.config.buttons = [this.buttonConfig];
    });
  }
  

}
