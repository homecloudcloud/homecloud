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
  selector:'network-main-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="network-main-form1" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-form-page id="network-main-form2" [config]="this.config3"></omv-intuition-form-page>
  <omv-navigation-page></omv-navigation-page>
  `,
  styleUrls: ['./network-main-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class NetworkMainComponent extends BaseFormPageComponent {
  
  public config2: FormPageConfig = {
        fields: [
          {
            type: 'paragraph',
            title: gettext('Wired Network:')
          },
          {
            type: 'paragraph',
            title: gettext('For Optimal Performance and Reliability use a Wired Network. Plug-in a network cable to Homecloud and your router to setup wired connection.')
          },
          {
            type: 'paragraph',
            title: gettext('Within few minutes Homecloud display should show network IP address. Use it to access Homecloud via web browser from your local network.')
          },
          {
            type: 'paragraph',
            title: gettext('If Homecloud display is off press power button once to turn it on.')
          },
          {
            type: 'paragraph',
            title: gettext('Insert display pic here')
          },
          {
            type: 'paragraph',
            title: gettext('Wi-Fi Setup (For temporary use when wired network unavailable)')
          },
          {
            type: 'paragraph',
            title: gettext('To configure Wi-FI network (when wired network is unavailable) activate Hotspot mode on Homecloud.')
          },
          {
            type: 'paragraph',
            title: gettext('Activate Hotspot: Press Homecloud power button 5 times in quick succession.')
          },
          {
            type: 'paragraph',
            title: gettext('Display may show a message and Homecloud will restart.')
          },
          {
            type: 'paragraph',
            title: gettext('On restart a temporary Wi-Fi network (SSID: Homecloud) will be created.')
          },
          {
            type: 'paragraph',
            title: gettext('Homecloud display with show SSID and password required to connect to it')
          },
          {
            type: 'paragraph',
            title: gettext('Insert display pic 2 here')
          },
          {
            type: 'paragraph',
            title: gettext('Connect your access device (e.g., phone, tablet, or laptop) to this WiFi SSID by going to Wifi settings and selecting this network.')
          },
          {
            type: 'paragraph',
            title: gettext('Homecloud display with show the URL e.g. https://172.31.1.1. Open it on the browser on your access device')
          },
          {
            type: 'paragraph',
            title: gettext('Login with your Homecloud username, password provided in the Homecloud package.')
          },
          {
            type: 'paragraph',
            title: gettext('Insert display pic 3 here')
          },
          {
            type: 'paragraph',
            title: gettext('Go to Network page and configure Wi-FI')
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
  constructor(private rpcService: RpcService,private sanitizer: DomSanitizer) {
    super();
    // Sanitize the title 
    this.config2.fields[7].title = this.sanitizer.bypassSecurityTrustHtml(this.config2.fields[7].title) as unknown as string;


  }

  ngAfterViewInit(): void {
        
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {
      
      // Select all paragraph elements 
      const paragraphs = document.querySelectorAll('#network-main-form1 .omv-form-paragraph');
      


      paragraphs[7].innerHTML =
      (this.config2.fields[7].title as any).changingThisBreaksApplicationSecurity ||
      this.config2.fields[7].title?.toString();
      
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
    
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getPaperlessServiceStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
    });
  }

}
