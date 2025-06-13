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

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  template: '<omv-intuition-form-page id="email-notification-form" [config]="this.config"></omv-intuition-form-page>',
  selector:'omv-notification-settings-form-page',  //Home cloud changes
  styles:[` 
        omv-notification-settings-form-page{
          .omv-form-paragraph{
            font-size:-var(--mat-font-size-subheading-2)!important;
            font-weight:-var(--mat-font-weight-subheading-2)!important;
          }
        }
        
  
  
  `]
})
export class NotificationSettingsFormPageComponent extends BaseFormPageComponent {
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
      {
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
        title: gettext('Gmail users first: <a class="drive-btn" href="https://myaccount.google.com/apppasswords" target="_blank"> generate Google App Password </a>'),
        name:'paragraph2'
      },
      {
        type: 'checkbox',
        name: 'enable',
        label: gettext('Enabled'),
        value: false
      },
      {
        type: 'textInput',
        name: 'server',
        label: gettext('SMTP server'),
        hint: gettext('Outgoing SMTP mail server address. Gmail users enter: smtp.gmail.com.'),
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
        hint: gettext('The default SMTP mail server port. Gmail users enter: 587.'),
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
        value: false
      },
      {
        type: 'textInput',
        name: 'username',
        label: gettext('User name - Enter your email account username e.g. Gmail e-mail id.'),
        value: '',
        autocomplete: 'off',
        modifiers: [
          {
            type: 'disabled',
            constraint: { operator: 'falsy', arg0: { prop: 'authenable' } }
          }
        ],
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'authenable' } }
        }
      },
      {
        type: 'passwordInput',
        name: 'password',
        label: gettext('Enter password for email account. For Gmail,Yahoo enter the app password generated.'),
        value: '',
        autocomplete: 'new-password',
        modifiers: [
          {
            type: 'disabled',
            constraint: { operator: 'falsy', arg0: { prop: 'authenable' } }
          }
        ],
        validators: {
          requiredIf: { operator: 'truthy', arg0: { prop: 'authenable' } }
        }
      },
      {
        type: 'divider',
        title: gettext('Recipient')
      },
      {
        type: 'textInput',
        name: 'primaryemail',
        label: gettext('Enter the email address to receive password reset links and system notifications. It can be the same as the sender email entered above or a different one.'),
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
    this.config.fields[1].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[1].title) as unknown as string;   
    
  }

  ngAfterViewInit(): void {
     
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {

      // Select all paragraph elements (assuming they are rendered as `window-drive-form1 omv-form-paragraph` elements)
        const paragraphs = document.querySelectorAll('#email-notification-form omv-form-paragraph');

        // Inject the sanitized HTML into the correct paragraph element
        paragraphs[1].innerHTML =
        (this.config.fields[1].title as any).changingThisBreaksApplicationSecurity ||
        this.config.fields[1].title?.toString();  
     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }
}
