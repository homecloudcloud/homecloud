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
import { ViewEncapsulation } from '@angular/core';
//import { ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  template: `<omv-logo-header></omv-logo-header>
            <div id="mainContainer">
              <div id="mainContent">
                      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
              </div>
              <omv-intuition-form-page [config]="this.config" id="mainContent1"></omv-intuition-form-page>
            </div>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons">
             </omv-intuition-form-page>`,
  selector:'omv-setupwizard-date-time-form-page',  //Home cloud changes
  styles: [`
    @import '../../../../assets/colors.scss';

  
    .omv-dark-theme{
       omv-setupwizard-date-time-form-page{
          #mainContainer{
          //  scrollbar-color:$lightblue transparent;
            --scrollbar-thumb-color:$lightblue !important;
            h1,h2,h3{color:$lightblue !important;}
            p,li{color:#ffffff !important;}
            .plainLink:hover,.plainLink:focus{
            background-color:$lightblue;
           
            }
          }
          
          #navButtons{
              .mat-card{
                    background-color:$lightblue!important;
              }
              .mat-card-actions{
                    button{
                      border:1px solid #ffffff!important;
                    
                    }
                    button:hover,button:focus{
                      background-color:#ffffff!important;
                      color:$lightblue!important;
                    }
              }
          }
          
          
       }
      }     
    omv-setupwizard-date-time-form-page{

      omv-top-bar-wizard .omv-top-bar{
        background:transparent!important;
        position: absolute;
        left:80vw;
    }
      omv-logo-header{
        position:fixed;
        height:20vh;
        top:0;
        left:0;
        z-index:100;
      }

      #mainContainer{
          margin-top:20vh!important;
          overflow-y:auto;
          height:70vh;     
          scrollbar-color:$lightblue transparent;
          --scrollbar-border-radius: 0 !important;
          --scrollbar-thumb-color:#ffffff !important;
          --scrollbar-thumb-hover-color: var(--scrollbar-thumb-color) !important;
      }
      #mainContent{
        
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

      #navButtons{
        position:fixed;
        width:100%;
        bottom:0;
        
        .mat-card{
            background-color:$blue!important;
        }
        mat-card-content{
            display:none!important;
        }
        .mat-card-actions{
            justify-content:space-between!important;
            flex-direction:row-reverse!important;
            button{
              border:1px solid #ffffff!important;
            
            }
            button:hover,button:focus{
              background-color:#ffffff!important;
              color:$lightblue!important;
            }
        }
        @media screen and (max-width: 600px) {
          .mat-card-actions{
            flex-direction:column-reverse!important;
            align-items:center!important;
            justify-content:center!important;
            row-gap:20px;
          }
        } 
      } 
    }
  `],
    encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
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
        }
        /*,
        {
          template: 'cancel',
          execute: {
            type: 'url',
            url: '/startconfiguration'
          }
        }
        */
      ]
    };
  constructor(private sanitizer: DomSanitizer) {
          super();
         
              // Sanitize the HTML content once during construction
              this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }

  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: VPN Access',
        disabled:false,
        execute:
        {
          type:'url',
          url:'/setupwizard/vpn/access'
        }
        
      },
      {template:'submit',
        text:'Next: Notification Set Up >',
        disabled:false,
        /*execute: {
          type: 'url',
          url: '/setupwizard/notificationsettings'
        }*/
        execute: {
          type: 'request',        
          request:{
            service: 'Flags',
            task:false,
            method: 'saveLastCompletedStep',
            params:{
              'lastCompletedStepName':'datetime'
            },
            successUrl:'/setupwizard/notificationsettings',
          }
        }
      }
    ]

  };
  ngAfterViewInit() {
    
    setTimeout(() => {
      const buttons = document.querySelectorAll('#navButtons omv-submit-button button');
       // Loop through all buttons and remove disabled class
       buttons.forEach(button => {
        if (button.classList.contains('mat-button-disabled')) {
          button.classList.remove('mat-button-disabled');
          button.removeAttribute('disabled');
        }
      });
    }, 100);
  }

 
   ngOnInit(): void {
    console.log('NotificationSettings initialized');
    const innerElement = document.querySelector('#mainContainer') as HTMLElement;
    console.log('scrolltop before:',innerElement.scrollTop);
    
    console.log('Inner Element:', innerElement);
    if (innerElement) {
      innerElement.scrollTop = 0; // Ensure the scroll position is at the top
    }
    console.log('scrolltop now:',innerElement.scrollTop);
  }
  

}
