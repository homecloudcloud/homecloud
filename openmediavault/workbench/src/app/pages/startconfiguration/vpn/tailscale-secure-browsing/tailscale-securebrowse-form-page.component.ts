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
//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector:'vpn-securebrowse-page', //Home cloud changes
  template: `
  <div id="vpn-securebrowse-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./tailscale-securebrowse-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class VPNSecurebrowseComponent extends BaseFormPageComponent implements AfterViewInit {
  
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `<h1>🛡️ Stay Safe on Public Wi-Fi</h1>
                          <p>
                          When using public Wi-Fi (like in cafes or airports ☕✈️), you can protect your internet activity
                          by securely routing all traffic through <strong>Homecloud</strong> using <strong>Tailscale VPN</strong> 🔐.
                          </p>

                          <h2>✅ How to Set It Up</h2>
                          <ol>
                              <li>🔧 Ensure <strong>Tailscale VPN</strong> is configured with <strong>Homecloud as an Exit Node</strong>
                              (See instructions below).</li>
                              <br>
                              <ul>

                                <li>Go to <a class="plainLink" target="_blank" href="https://login.tailscale.com/admin/machines"><strong>Tailscale admin console</strong></a>.</li><br>
                                <li>In the list of machines find <strong>homecloud</strong> >> on the right side press three dots ... >> <strong>Edit route settings</strong> >> <strong>Enable Use as exit node</strong> >> Save</li>
                                <br>
                                <div class="exit-node-imgs">
                                    <img class="exit-node-img" src="/assets/images/vpn-exitnode.jpg" alt="exit-node"/>
                                    <img class="exit-node-img" src="/assets/images/vpn-exitnode2.jpg" alt="exit-node2"/>
                                </div>
                              </ul>
                              <br>
                              <li>
                                📱 On your phone or laptop connected to public Wi-Fi:
                              </li>
                              <br>
                              <ul>
                                <li>Open the <strong>Tailscale app</strong></li><br>
                                <li>Verify it's connected to the <strong>same account</strong> as Homecloud</li><br>
                                <li>Find <strong>Homecloud</strong> in the list and <strong>enable Exit Node</strong> 🌐</li>
                                <br>
                                <img class="exit-node-img" src="/assets/images/exit_node_tailscale_app.jpg" alt="exit-node-app"/>
                                
                              </ul>
                              <br>
                              <li>
                              🔒 Your internet traffic is now securely routed through Homecloud — encrypted and safe from snooping 👀
                              </li>
                          </ol>

                          <p>🚀 You're now browsing securely on any network!</p>
                          `;
  
  constructor(private sanitizer: DomSanitizer) {
    super();
    // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }

  ngAfterViewInit(): void {
    // No need for manual DOM manipulation anymore
  }
}
