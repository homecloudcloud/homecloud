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
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';

@Component({
  selector:'network-main-page', //Home cloud changes
  template: `
  <div id="network-main-form1">
    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
  </div>
  <omv-intuition-form-page id="network-main-form2" [config]="this.config3"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./network-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class NetworkMainComponent extends BaseFormPageComponent implements AfterViewInit {
  
  public safeHtmlContent: SafeHtml;
  
  private htmlContent = `<div class="section">
    <h1>Connecting Homecloud to Network</h1>
    <p>There are two ways to connect your Homecloud to a network: via a wired Ethernet connection or through Wi-Fi. For the best performance and stability, we recommend using a wired connection whenever possible.</p>
  </div>           
  <div class="section">
    <h2>🖧 Wired Network (Recommended for Best Performance)</h2>
    <p>For optimal performance and reliability, use a wired Ethernet connection.</p>
    <ul>
      <li><strong>Connect Ethernet Cable:</strong> Plug one end into your Homecloud and the other into your router.</li><br>
      <li><strong>Wait for IP Address:</strong> After a few minutes, the Homecloud display will show its assigned <strong>IP address</strong>.</li><br>
      <li><strong>Access Homecloud:</strong> Enter the IP address into your web browser on any device connected to the same local network.</li><br>
      <li><strong>Power On If Display Is Off:</strong> Press the power button <strong>once</strong> to turn on the display if it's off.</li><br>
    </ul>
  </div>

  <div class="section">
    <h2>📶 Wi-Fi Setup (For Temporary Use When Wired Network Is Unavailable)</h2>
    <p>If you can't use a wired connection, use the temporary <strong>Hotspot mode</strong> to connect to Homecloud and set up Wi-Fi.</p>
    <ul>
      <li><strong>Activate Hotspot Mode:</strong> Press the <strong>power button 5 times quickly</strong>. Homecloud will display a message and then restart.</li><br>
      <li><strong>Connect to Homecloud's Temporary Wi-Fi:</strong><br>
        <ul>
          <li>Look for the <strong>SSID: Homecloud</strong> on your access device's(Phone,Laptop) Wi-Fi list.</li>
          <li>Connect using the <strong>password</strong> shown on the Homecloud display.</li>
        </ul>
      </li>
      <li><strong>Access the Setup Page:</strong> The display will show a URL (e.g., <code>https://172.31.1.1</code>). Open this in your browser.</li><br>
      <li><strong>Login:</strong> Use the <strong>username and password</strong> provided in the Homecloud package.</li><br>
      <li><strong>Configure Wi-Fi:</strong> Navigate to the <strong><a class="plainLink" href="/#/startconfiguration/networkconfig/interfaces">Network->Interfaces</strong></a> page and enter your Wi-Fi credentials.</li>
    </ul>
  </div>`;

  public config2: FormPageConfig = {
    
    fields: [
      {
        type: 'paragraph',
        title: ''
      }
    ]
  };

  public config3: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getHotspotStatus'
      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'active',
        label: gettext('Hotspot status'),
        hint: gettext(''),
        value: '',
        readonly: true
      }
    ]
  };
  
  constructor(private sanitizer: DomSanitizer,private rpcService:RpcService) {
    super();
    // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }

  ngOnInit():void{
   this.rpcService.request('Homecloud', 'getHotspotStatus').subscribe((response: any) => {
        const hotSpotForm = document.getElementById('network-main-form2');
        if(hotSpotForm){
          // Check if the response is defined and has the 'active' property
          if(response && response.active !== 'Active'){                   
              hotSpotForm.classList.add('hidden');
          }
          
          else{
              hotSpotForm.classList.remove('hidden');
          }
        }
   });
  }

  ngAfterViewInit(): void {
    
  }
}
