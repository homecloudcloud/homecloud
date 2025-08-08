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
import { RpcService } from '~/app/shared/services/rpc.service';

@Component({
  template: `<omv-complete-logo-header></omv-complete-logo-header>
            <div id="mainContainer">
              <div id="notification-form1">
                      <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
              </div>
              <omv-intuition-form-page [config]="this.config" id="email-notification-form"></omv-intuition-form-page>
            </div>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons">
             </omv-intuition-form-page>`,
  selector:'omv-setupwizard-notification-settings-form-page',  //Home cloud changes
  styles: [`
    @import '../../../../assets/colors.scss';

    
    .omv-dark-theme{
       omv-setupwizard-notification-settings-form-page{

          #mainContainer{
              h1,h2,h3{color:$lightblue !important;}
              p,li{color:#ffffff !important;}
              //scrollbar-color:$lightblue transparent;
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
    omv-setupwizard-notification-settings-form-page{

          /*omv-top-bar-wizard .omv-top-bar{
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
          }*/
          omv-top-bar-wizard .omv-top-bar{
          background:transparent!important;
          position: absolute;
          left:80vw;
            }

          omv-complete-logo-header{
              position:fixed;
              height:20vh;
              top:0;
              left:0;
              z-index:100;
              omv-apply-config-panel{
                  margin-top:2rem!important;
              }
            }
          #mainContainer{
              margin-top:20vh;
              overflow-y:auto;
              height:70vh;     
              scrollbar-color:$lightblue transparent;
              --scrollbar-border-radius: 0 !important;
              --scrollbar-thumb-color:red !important;
              --scrollbar-thumb-hover-color: var(--scrollbar-thumb-color) !important;

              p.internetError{
                color:$lightred;
                font-weight:bold;
                padding:2rem;
              }

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
        value: false
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
      /*{
        template: 'cancel',
        execute: {
          type: 'url',
          url: '/system/notification'
        }
      },
      */
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
        text:'Next: Apps-Main Page >',
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
            successUrl:'/setupwizard/apps',
            progressMessage: gettext('Please wait, checking notification email...'),
            successNotification: gettext('Notification email check completed successfully.'),
            
          }
        }
      }
    ]

  };
  
 constructor(private sanitizer: DomSanitizer,private rpcService:RpcService) {
    super();
    //this.config.fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].title) as unknown as string;   
     // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }
  ngAfterViewInit(): void {
     
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {

      // Select all paragraph elements (assuming they are rendered as `window-drive-form1 omv-form-paragraph` elements)
       // const paragraphs = document.querySelectorAll('omv-setupwizard-notification-settings-form-page #email-notification-form omv-form-paragraph');

        /* Inject the sanitized HTML into the correct paragraph element
        paragraphs[1].innerHTML =
        (this.config.fields[2].title as any).changingThisBreaksApplicationSecurity ||
        this.config.fields[2].title?.toString();  
        */
        this.enableNavButtons();
        this.checkInternetStatus();

     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  checkInternetStatus(){
      const notificationForm = document.querySelector('omv-setupwizard-notification-settings-form-page #email-notification-form');
      
      this.rpcService.request('Homecloud', 'checkInternetStatusForWizard').subscribe(response => {
        if (response.internetConnected !== true) { //Internet down
          
          if(notificationForm){
            notificationForm.classList.add('hidden');
            notificationForm.insertAdjacentHTML('afterend','<br><p class="internetError">Homecloud is not connected to Internet.Go to <a class="plainLink" href="#/setupwizard/networkconfig/interfaces">Network Interfaces</a> page to check the status. Connect Homecloud to Internet and try again</p>');
          }
                   
        } 
      
    });
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

   ngOnInit(): void {
   // console.log('NotificationSettings initialized');
    const innerElement = document.querySelector('#mainContainer') as HTMLElement;
    //console.log('scrolltop before:',innerElement.scrollTop);
    
    //console.log('Inner Element:', innerElement);
    if (innerElement) {
      innerElement.scrollTop = 0; // Ensure the scroll position is at the top
    }
    //console.log('scrolltop now:',innerElement.scrollTop);
  }

}
