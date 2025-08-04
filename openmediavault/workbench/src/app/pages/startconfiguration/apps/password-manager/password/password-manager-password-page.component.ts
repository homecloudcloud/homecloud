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
//import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';




@Component({
  selector:'omv-password-manager-password-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `<div id="password-manager-password-form1">
              <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
            </div>
  `,
  styleUrls: ['./password-manager-password-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPasswordManagerPasswordResetComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  private hostname:string='';
  private vaultStatus:string='';
  //private paperlessUser:string='';
  
  private htmlContent='';
  
  constructor(private sanitizer: DomSanitizer,private rpcService:RpcService) {
    super();
     
  }

  ngOnInit(){


    this.rpcService.request('Homecloud', 'getVaultwardenServiceStatus').subscribe(response => {
      this.hostname = response.hostname; // Adjust based on API response structure
      this.vaultStatus = response.status;
      this.updateHtml();
    });


  }
  updateHtml(){
     this.htmlContent=`<div class="container">
                        <h1>🔐 Forgot your Master Password?</h1>
                        <p>
                        Vaultwarden keeps your data safe by encrypting everything right on your Homecloud 🌥️.
                        That means <strong>only you</strong> can unlock it — <em>even we can’t reset your Master Password</em>.
                        </p>
                        <p>
                        🧠 But don’t worry! If you set a <strong>Password Hint</strong> when creating your account, you can still get help.
                        </p>
                        <ol>
                          <li>👉 Go to <a class="app-btn ${this.vaultStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}" target="_blank"><strong>Password manager web app</strong></a><br>
                          <span class="status-error ${this.vaultStatus !== 'Running' ? '' : 'hidden'}" >Vaultwarden is not running! Go to <a href="#/startconfiguration/apps/password-manager/restart" class="plainLink"><strong>Password manager status page</strong></a> to check the status or restart the app</span>
                          </li>
                          <li>Enter your <strong>email address</strong> and click <strong>Continue</strong>.</li>
                          <li>Click <strong>"Get Master Password Hint"</strong>.</li>
                          <li>You'll receive an email ✉️ with your password hint.</li>
                        </ol>
                        <div class="tip">
                        🛡️ <strong>Pro Tip:</strong> Always set a helpful password hint when creating your account — it’s your only safety net!
                        </div>
                      </div>`;

      // Sanitize the HTML content 
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }
 

  

}
