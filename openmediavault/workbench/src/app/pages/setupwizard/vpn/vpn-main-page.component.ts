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
//import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector:'vpn-setupwizard-main-page', //Home cloud changes
  template: `
  <omv-logo-header></omv-logo-header>
  <div id="mainContainer">
    <div id="vpn-main-form1">
      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
    </div>
  </div>
  <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>
 
  `,
  styleUrls: ['./vpn-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class VPNMainComponent extends BaseFormPageComponent implements AfterViewInit {
  
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `<h1>🌐 Access Homecloud Remotely</h1>
                        <p>
                        To access <strong>Homecloud and its apps</strong> from your phone or laptop over the internet,
                        you'll need to set up a secure <strong>VPN connection</strong> 🔐.
                        </p>
                        <p>
                        ☁️ Homecloud supports <strong>Tailscale VPN</strong>, a third-party service.
                        You'll need to <strong>sign up for a free account</strong> on their website to get started.
                        </p>
                        <p>
                        ▶️ Begin setup from the 👉 <a href="#setupwizard/vpn/tailscaleconfig/" class="plainLink"><strong>Configuration Page</strong></a>.
                        </p>

                        <hr />

                        <h2>❗ Don't Want to Use VPN?</h3>
                        <ul>
                        <li>🏠 You'll only be able to access Homecloud on your <strong>local network</strong>.</li>
                        <li>🔒 Some apps — like the <strong>password manager</strong> — require an <strong>SSL certificate</strong> and may <strong>not work or have limited functionality</strong> without VPN.</li>
                        </ul>
                          `;
  
  constructor(private sanitizer: DomSanitizer) {
    super();
    // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }

  ngAfterViewInit(): void {
    // No need for manual DOM manipulation anymore
  }
  public navconfig: FormPageConfig = {
  
      fields:[
        
      ],
      buttons: [
        
        {template:'submit',
          text:'< Prev: Network Interfaces',
          execute:
          {
            type:'url',
            url:'/setupwizard/networkconfig/interfaces'
          }
          
        },
        
        {template:'submit',
          text:'Next: VPN Configuration',
          execute: {
            type: 'request',        
            request:{
              service: 'Flags',
              task:false,
              method: 'saveLastCompletedStep',
              params:{
                'lastCompletedStepName':'vpnMain'
              },
              successUrl:'/setupwizard/vpn/tailscaleconfig',
            }
          }
        },
      //Set this step as last complete step if skipped
      {template:'submit',
        text:'Skip VPN Setup',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'If VPN is not configured, You will not be able to access Homecloud from outside your local network. Some applications like Password manager will also not work without VPN. Do you still want to skip?<b>Note:</b> You can also configure VPN later from Homecloud Dashboard.'
        },
        
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'vpnAccess'
            },
            successUrl:'/setupwizard/datetime',
          }
        }
      }
      
      ]
    };
}
