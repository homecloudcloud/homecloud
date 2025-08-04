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

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';

@Component({
  template: `
             <div id="datetime-form1">
                    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
             </div>
             <omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>
            `,
  selector:'omv-date-time-form-page',  //Home cloud changes
  styles: [`
      @import '../../../../assets/colors.scss';
      .omv-dark-theme{
       
          h1,h2,h3{
          color:$lightblue !important;
          }
         
      }
      omv-date-time-form-page{
        #datetime-form1{
          margin-bottom:-3rem;
          .omv-form-paragraph{
          padding:2rem;
          line-height: 1.5rem;
        }
  
        }
       
        .omv-form-paragraph,h2,p,li,h3 {
          font-size: var(--mat-font-size-subheading-2) !important;
        
        }
        .omv-form-paragraph,p,li {
          font-size: var(--mat-font-size-subheading-2) !important;
          font-weight:var(--mat-font-weight-subheading-2) !important;
        }
        h1{
          font-size: var(--mat-font-size-headline) !important;
        
        }
      
        
        h2,h1,h3 {
          color:$blue;
        }
  
        
        
        ul {
          list-style-type: disc;
          margin-left: 20px;
        }
  
        .hidden{
          display:none !important;
        }
        .plainLink{
          font-weight:bold;
        }
        .plainLink:hover,.plainLink:focus{
          background-color:$lightblue;
          color:white;
          padding:10px;
          text-decoration: none;
          font-weight:bold;
        }
  
      
      }
      
     
    `],
    encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})
export class DateTimeFormPageComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  private htmlContent=`<h1>🌍 Set Your Timezone</h1>
                      <p>
                      Choose the <strong>timezone</strong> where your <strong>Homecloud</strong> is deployed ⏰.<br/>
                      This ensures accurate time tracking for logs, schedules, and backups.
                      </p>`;
  public config: FormPageConfig = {
    request: {
      service: 'System',
      get: {
        method: 'getTimeSettings'
      },
      post: {
        method: 'setTimeSettings'
      }
    },
    fields: [
      {
        type: 'select',
        name: 'timezone',
        label: gettext('Time zone'),
        store: {
          proxy: {
            service: 'System',
            get: {
              method: 'getTimeZoneList'
            }
          }
        },
        textField: 'value',
        value: 'UTC'
      },
      {
        type: 'checkbox',
        name: 'ntpenable',
        label: gettext('Use NTP server'),
        //value: false
        value: true,
        disabled: true,
        submitValue: true
      },
      {
        type: 'textInput',
        name: 'ntptimeservers',
        label: gettext('Time servers'),
        value: 'pool.ntp.org',
        modifiers: [
          {
            //type: 'enabled',
            type: 'disabled',
            constraint: { operator: 'truthy', arg0: { prop: 'ntpenable' } }
          }
        ],
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'ntpenable' } },
          patternType: 'domainNameIpList'
        }
      },
      {
        type: 'textInput',
        name: 'ntpclients',
        label: gettext('Allowed clients'),
        hint: gettext(
          'IP addresses in CIDR notation or host names of clients that are allowed to access the NTP server.'
        ),
        value: '',
        modifiers: [
          {
            type: 'hidden'
            //constraint: { operator: 'falsy', arg0: { prop: 'ntpenable' } }
          }
        ],
        validators: {
          patternType: 'hostNameIpNetCidrList'
        } 
      }
    ],
    buttons: [
      {
        template: 'submit'
      },
      {
        template: 'cancel',
        execute: {
          type: 'url',
          url: '/startconfiguration'
        }
      }
    ]
  };
  constructor(private sanitizer: DomSanitizer) {
        super();
       
            // Sanitize the HTML content once during construction
            this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
      }
      
}
