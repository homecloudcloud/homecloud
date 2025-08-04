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
  template: `<div id="notification-form1">
                    <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
             </div>
              <omv-intuition-form-page id="email-notification-form" [config]="this.config"></omv-intuition-form-page>`,
  selector:'omv-notification-settings-form-page',  //Home cloud changes
  styles:[` 
      @import '../../../../assets/colors.scss';
      .omv-dark-theme{
       
          h1,h2,h3{
          color:$lightblue !important;
          }
         
      }
        omv-notification-settings-form-page{
            #notification-form1{
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

          @media screen and (max-width: 768px) {
                .mat-form-field-infix{
                    .mat-input-element{
                      margin-top:2rem;
                    }
                    .mat-form-field-label{
                      text-wrap:wrap;
                    }
                }
          }
         
        
      }
        
  
  
  `],
    encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
})
export class NotificationSettingsFormPageComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  private htmlContent=`<h1>✉️ Set Up Email Notifications</h1>
                      <p>
                        To use features like <strong>password reset</strong> and receive <strong>important alerts</strong>,
                        configure your email settings below 📬.
                      </p>

                      <p>
                        🛡️ <strong>Homecloud uses your personal email account</strong> to send notifications — ensuring your privacy.
                        To do this, you’ll need to authorize email sending through your provider.
                      </p>

                      <div class="setup-steps">
                        <ul>
                        <li>📌 Settings vary by email provider.</li><br>
                        <li>
                        💡 For <strong>Gmail</strong> or <strong>Yahoo</strong>, generate an <strong>App Password</strong>.
                        <br/>👉 <a class="plainLink" href="https://myaccount.google.com/apppasswords" target="_blank">Generate Gmail App Password</a>
                        </li><br>
                        <li>🧾 Then, complete the form below with your email settings.</li>
                        </ul>
                      </div>

                     `;
  public config: FormPageConfig = {
    request: {
      service: 'EmailNotification',
      get: {
        method: 'get'
      },
      post: {
        method: 'set'
      }
    },
    fields: [
      /*{
        type: 'paragraph',
        title: gettext('To enable password reset functionality and receive important notifications, set up your email settings. Your email provider will be used to send messages directly to your inbox.If you are using Gmail or Yahoo, you will need to generate an app-specific password to allow Homecloud to send notifications from your account.'),
        name:'paragraph1'
      },
      {
        type: 'divider',
        title: gettext('Settings for sending email notifications')
      },
      {
        type: 'paragraph',
        title: gettext(`Gmail users first: <a class="plainLink" href="https://myaccount.google.com/apppasswords" target="_blank"> generate Google App Password </a>`),
        name:'paragraph2'
      },
      */
     {
        type: 'divider',
        title: gettext('Account setup for sending E-mails')
      },
      {
        type: 'checkbox',
        name: 'enable',
        label: gettext('Enabled'),
        value: true
      },
      {
        type: 'textInput',
        name: 'server',
        label: gettext('Outgoing SMTP server'),
        hint: gettext('For Gmail enter: smtp.gmail.com'),
        value: 'smtp.gmail.com',
        validators: {
          requiredIf: { operator: 'eq', arg0: { prop: 'enable' }, arg1: true },
          patternType: 'domainNameIp'
        }
      },
      {
        type: 'numberInput',
        name: 'port',
        label: gettext('SMTP port'),
        hint: gettext('For Gmail enter: 587.'),
        value: 587,
        validators: {
          min: 1,
          max: 65535,
          required: true,
          patternType: 'port'
        }
      },
      {
        type: 'select',
        name: 'tls',
        label: gettext('Encryption mode'),
        value: 'auto',
        store: {
          data: [
            ['none', gettext('None')],
            ['ssl', gettext('SSL/TLS')],
            ['starttls', gettext('STARTTLS')],
            ['auto', gettext('Auto')]
          ]
        }
      },
      {
        type: 'textInput',
        name: 'sender',
        label: gettext('Enter the email id to use for sending emails. Gmail users: Enter your full email address ending with @gmail.com'),
        value: '',
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'enable' } },
          patternType: 'email'
        }
      },
      {
        type: 'checkbox',
        name: 'authenable',
        label: gettext('Authentication required'),
        value: true,
        modifiers: [
          {
            type: 'hidden'
          }
        ]
      },
      {
        type: 'textInput',
        name: 'username',
        label: gettext('User name. For Gmail,Yahoo enter your full email id.'),
        value: '',
        autocomplete: 'off',
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'enable' } }
        }
      },
      {
        type: 'passwordInput',
        name: 'password',
        label: gettext('Enter password for email account. For Gmail,Yahoo enter the app password generated.'),
        value: '',
        autocomplete: 'new-password',
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'enable' } }
        }
      },
      {
        type: 'divider',
        title: gettext('Admin Email Id (Recovery Password will be sent here)')
      },
      {
        type: 'textInput',
        name: 'primaryemail',
        label: gettext('Notifications and admin password (if you forget) will be sent here so make sure it is correct. You may keep it same as your sending account'),
        value: '',
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'enable' } },
          patternType: 'email'
        }
      }
      ,
      {
        type: 'textInput',
        name: 'secondaryemail',
        label: gettext('Secondary email - Additional e-mail address'),
        value: '',
        modifiers: [
          {
            type: 'hidden'  // This will hide the field in the UI
          }
        ],
        validators: {
          patternType: 'email'
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
          url: '/system/notification'
        }
      },
      {
        text: gettext('Test'),
        enabledConstraint: { operator: 'truthy', arg0: { prop: 'enable' } },
        execute: {
          type: 'request',
          request: {
            service: 'EmailNotification',
            method: 'sendTestEmail',
            progressMessage: gettext('Please wait, sending a test email ...'),
            successNotification: gettext(
              // eslint-disable-next-line max-len
              'An attempt to send the test email has been made. Please check your mailbox. If the email does not arrive, check spam folders or account settings. '
            )
          }
        }
      }
    ]
  };
  constructor(private sanitizer: DomSanitizer) {
    super();
    //this.config.fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].title) as unknown as string;   
     // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }

  /*ngAfterViewInit(): void {
     
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {

      // Select all paragraph elements (assuming they are rendered as `window-drive-form1 omv-form-paragraph` elements)
        const paragraphs = document.querySelectorAll('omv-notification-settings-form-page #email-notification-form omv-form-paragraph');

        // Inject the sanitized HTML into the correct paragraph element
        paragraphs[1].innerHTML =
        (this.config.fields[2].title as any).changingThisBreaksApplicationSecurity ||
        this.config.fields[2].title?.toString();  
     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }
    */
}
