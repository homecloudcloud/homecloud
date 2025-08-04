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
  selector:'omv-jellyfin-resetpassword-page', //Home cloud changes
  //template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  template: `
  <omv-intuition-form-page id="jellyfin-resetpassword-form1" [config]="this.config3"></omv-intuition-form-page> 

  `,
  styleUrls: ['./jellyfin-resetpassword-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})



export class AppsJellyfinResetPasswordComponent extends BaseFormPageComponent {
  private htmlContent:string='';
  private jellyfinUsers: string = '';
  private hostname: string = '';
  private jellyfinStatus: string = '';
 
 
  public config3: FormPageConfig = {
    fields: [
    
     {type:'paragraph',
        title:''
      }
    ],
    buttons: [
      {
        text: gettext(`🔑 Get Reset PIN`),
        disabled:false,
        submit:true,
       // class:'omv-background-color-pair-primary',
        class:'lightblue white',
        confirmationDialogConfig:{
          template: 'confirmation',
          title: '',
          message: 'Make sure you have generated PIN from Jellyfin webapp using Forgot Password option before proceeding further. You want to continue?'
        },
        execute: {
          type: 'url',
          url: '/startconfiguration/apps/media/password/display'
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
    this.rpcService.request('Homecloud', 'jellyfin_getusers').subscribe(response => {
      this.jellyfinUsers = response.users;
      //console.log('jellyfin users',this.jellyfinUsers);
      this.updateFieldVisibility(this.jellyfinUsers);//enable or disable button based on user
      this.rpcService.request('Homecloud', 'getJellyfinServiceStatus').subscribe(response => {
          this.hostname = response.hostname; // Adjust based on API response structure
          this.jellyfinStatus = response.status; // Store the status for later use
          this.updateHtml();
      });


     
    });
  }
 

  updateFieldVisibility(jellyfinUsers:string):void{
  
    const button = document.querySelector('#jellyfin-resetpassword-form1 button');
    if(button){
      if(jellyfinUsers === ''){
        button.classList.add('disabled-btn');
      }else{
        button.classList.remove('disabled-btn');
      }
    }
  }

  updateHtml():void{

    this.htmlContent=`         
                      <div class="container">
                          <h1>🔐 Forgot Your Jellyfin Password?</h1>
                          <p>No worries! Follow these steps to reset it safely:</p>
                          <ol>
                              <li>👥 Check the list of existing Jellyfin users below.</li><br>
                              <p><strong>${this.jellyfinUsers}</strong></p>
                              <hr>
                              <div class="note">
                                📭 <strong>Note:</strong> If the list of users is empty, it means:
                                <ul>
                                  <li>⚙️ Jellyfin is not deployed yet, or</li>
                                  <li>👤 No Jellyfin users have been created yet.</li>
                                </ul>
                              </div>
                              <br>
                              <li>🌐 Open the 👉 <a href="${this.hostname}" class="app-btn ${this.jellyfinStatus !== 'Running' ? 'disabled-btn' : ''}" target="_blank"><strong>Jellyfin Web App</strong></a>.<br>
                               <span class="status-error ${this.jellyfinStatus !== 'Running' ? '' : 'hidden'}" >Jellyfin is not running! Go to <a href="#/startconfiguration/apps/media/restart" class="plainLink"><strong>Jellyfin status page</strong></a> to check the status or restart the app</span>
                               </li><br>
                              <li>🔘 Click on <strong>Forgot Password</strong>.</li><br>
                              <li>✍️ Enter the username you want to reset and click <strong>Submit</strong>.</li><br>
                              <li>📄 Wait for the message: <em>“A file has been created.”</em></li><br>
                              <li>🔁 Return to this page and click the button below to get your PIN.</li><br>
                              <li>📋 Copy the PIN and paste it into the Jellyfin screen when prompted.</li>
                          </ol>
                      </div>`;

      
         this.config3.fields[0].title = this.htmlContent;
         // Sanitize the HTML content once during construction
         this.config3.fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config3.fields[0].title) as unknown as string;
          // Select all paragraph elements 
         const paragraphs = document.querySelectorAll('omv-jellyfin-resetpassword-page omv-form-paragraph .omv-form-paragraph');
      
         // Inject the sanitized HTML into the correct paragraph element       
         paragraphs[0].innerHTML =
         (this.config3.fields[0].title as any).changingThisBreaksApplicationSecurity ||
         this.config3.fields[0].title?.toString();

  }
  
 
 
}
