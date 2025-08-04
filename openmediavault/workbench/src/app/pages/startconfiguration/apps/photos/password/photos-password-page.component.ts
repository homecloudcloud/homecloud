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
import { RpcService } from '~/app/shared/services/rpc.service';
import { DomSanitizer } from '@angular/platform-browser';
//import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';





@Component({
  selector:'omv-photos-password-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="photos-password-form1" [config]="this.config"></omv-intuition-form-page>
  `,
  styleUrls: ['./photos-password-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})

export class AppsPhotosPasswordResetComponent extends BaseFormPageComponent {
  private htmlContent:string='';
  private immichUser: string = '';
  private hostname: string = '';
  private immichStatus: string = '';
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'immich_get_admin_users'

      }
    },
    fields: [
      
     /* {
        type: 'paragraph',
        title: gettext('If you forgot password of the user account with admin priviliges (first user id created in Immich) you can reset it here using instructions below.')
      },
      {
        type: 'paragraph',
        title: gettext('IMPORTANT: Other user accounts (non admin) can be reset by this user using Immich webapp (via webbrowser)')
      },
      {
        type: 'paragraph',
        title: gettext('Note: This affects only Immich user id')
      },
      {
        type: 'paragraph',
        title: gettext('User id with admin priviliges in Immich.')
      },
      */
      {type:'paragraph',
        title:''
      }
      /*{
        type: 'textInput',
        name: 'email',
        label: gettext('Immich user with admin priviliges'),
        hint: gettext('Blank means no Immich user created yet. Go to Access page and open WebApp to create first user'),
        value: '',
        readonly: true
      }
      */

    ],
    buttons: [
      {
        text: gettext(`🔁 Reset Admin Password`),
        disabled:false,
        submit:true,
       // class:'omv-background-color-pair-primary',
        class:'lightblue white',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'This will reset password of the displayed user. You want to proceed?'
        },
        execute: {
          type: 'url',
          url: '/startconfiguration/apps/photos/password/display'
        }
      }
    ],
    buttonAlign: 'start' // You can adjust the alignment to 'start', 'center', or 'end'

  };

 constructor(private sanitizer: DomSanitizer,private rpcService:RpcService) {
         super();
       
  }
 

  ngOnInit(){
   // console.log('ngOnInit called');
    this.fetchUsersAndUpdateFields();  //get hostname value and update in link
  }
  fetchUsersAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'immich_get_admin_users').subscribe(response => {
      this.immichUser = response.email;
      //console.log('immichUser',this.immichUser);
      this.updateFieldVisibility(this.immichUser);//enable or disable button based on user
      this.rpcService.request('Homecloud', 'getImmichServiceStatus').subscribe(response => {
         // console.log(this.hostname);
          this.hostname = response.hostname; // Adjust based on API response structure
          this.immichStatus = response.status;
          this.updateHtml();
      });


     
    });
  }
 

  updateFieldVisibility(immichUser:string):void{
  
    const button = document.querySelector('#photos-password-form1 button');
    if(button){
      if(immichUser === ''){
        button.classList.add('disabled-btn');
      }else{
        button.classList.remove('disabled-btn');
      }
    }
  }

  updateHtml():void{

    this.htmlContent=` <div class="container">
                        <h1>🔐 Forgot Immich Password?</h1>
                        <p>
                        You can reset any Immich user's password by logging into the
                        👉 <a class="app-btn ${this.immichStatus !== 'Running' ? 'disabled-btn' : ''}" href="${this.hostname}" target="_blank"><strong>Immich web app</strong></a>
                        with a user account that has <strong>admin privileges</strong> 👑.<br>
                        <span class="status-error ${this.immichStatus !== 'Running' ? '' : 'hidden'}" >Immich is not running! Go to <a href="#/startconfiguration/apps/photos/restart" class="plainLink"><strong>photos status page</strong></a> to check the status or restart the app</span></p>
                        </p>

                        <p>The current admin user is shown below:</p>
                        <p><strong>${this.immichUser}</strong></p>
                        <!-- Admin user form display here -->

                        <hr />

                        <h2>🛑 Forgot Admin User's Password?</h2>
                        <p>
                        If you’ve lost access to the admin account, you can reset it using the button below:
                        </p>
                        <div class="note">
                        📭 <strong>Note:</strong> If the admin field is empty, it means:
                        <ul>
                          <li>⚙️ Immich is not deployed yet, or</li>
                          <li>👤 The first admin user hasn’t been created.</li>
                        </ul>
                        </div>
                      </div>`;

      
         this.config.fields[0].title = this.htmlContent;
         // Sanitize the HTML content once during construction
         this.config.fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[0].title) as unknown as string;
          // Select all paragraph elements 
         const paragraphs = document.querySelectorAll('omv-photos-password-page omv-form-paragraph .omv-form-paragraph');
      
         // Inject the sanitized HTML into the correct paragraph element       
         paragraphs[0].innerHTML =
         (this.config.fields[0].title as any).changingThisBreaksApplicationSecurity ||
         this.config.fields[0].title?.toString();

  }
  

}
