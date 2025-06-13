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
import { ViewEncapsulation } from '@angular/core';

@Component({
  template: `<omv-logo-header></omv-logo-header>
             <omv-intuition-form-page [config]="this.config" id="email-notification-form"></omv-intuition-form-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons">
             </omv-intuition-form-page>`,
  selector:'omv-notification-settings-form-page',  //Home cloud changes
  styles: [`
    @import '../../../../assets/colors.scss';
    omv-notification-settings-form-page{

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
    
      #email-notification-form{
          
        .mat-card{
            margin-top:20vh!important;
            .omv-form-paragraph{
              font-weight:var(--mat-font-weight-subheading-2);
              font-size:var(--mat-font-size-subheading-2);

            }

        }
      }
      #navButtons{
        .mat-card{
            background-color:$blue!important;
        }
        mat-card-content{
            display:none!important;
        }
        .mat-card-actions{
            justify-content:space-between!important;
            flex-direction:row-reverse!important;
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
    encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
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
        title: gettext('Homecloud can send you e-mail notifications about security events, low storage and more. To enable you will need a Gmail or any other SMTP relay provider account and generate an app password for authentication'),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`To generate Google app password go to : <a class="plainLink" href="https://myaccount.google.com/apppasswords" target="_blank"> Create Google App Password </a>`),
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
        hint: gettext('Outgoing SMTP mail server address, e.g. smtp.gmail.com.'),
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
        hint: gettext('The default SMTP mail server port, e.g. for gmail it is 587.'),
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
        label: gettext('Sender email - Enter your Gmail account e-mail id which will be used to send e-mail notifications'),
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
        label: gettext('User name - Enter your Gmail account e-mail id'),
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
        label: gettext('Password - Paste your app password generated in Google Account here'),
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
        label: gettext('Receiver email - Probably it will be your e-mail address that is same as sender'),
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
          url: '/setupwizard/notificationsettings'
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
              'An attempt to send the test email has been made. Please check your mailbox. If the email does not arrive, check any spam folders and also check there are no Postfix related errors in the system log.'
            )
          }
        }
      }
    ]
  };

  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'< Prev: Date Time Set Up',
        disabled:false,
        execute:
        {
          type:'url',
          url:'/setupwizard/datetime'
        }
        
      },
      {template:'submit',
        text:'Next: Apps-Drive Set Up >',
        disabled:false,
        /*execute: {
          type: 'url',
          url: '/setupwizard/apps/drive'
        }*/
        execute: {
          type: 'request',        
          request:{
            service: 'HomeCloud',
            task:false,
            method: 'checkNotificationEmailForWizard',
            successUrl:'/setupwizard/apps/drive',
            progressMessage: gettext('Please wait, checking notification email...'),
            successNotification: gettext('Notification email check completed successfully.'),
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
        
        this.enableNavButtons();
     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }

  enableNavButtons() {
    const buttons = document.querySelectorAll('#navButtons omv-submit-button button');
       // Loop through all buttons and remove disabled class
       buttons.forEach(button => {
        if (button.classList.contains('mat-button-disabled')) {
          button.classList.remove('mat-button-disabled');
          button.removeAttribute('disabled');
        }
      });
    
  }

}
