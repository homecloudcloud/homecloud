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
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';



@Component({
  selector:'omv-tailscale-startconfig-access-page', //Home cloud changes
  template: `<div id="tailscale-access-form1">
                <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
             </div>
             <omv-intuition-form-page [config]="this.config" id="tailscale-access-page"></omv-intuition-form-page>
             `,

  styles: [`
    @import '../../../../../assets/colors.scss';
    .omv-dark-theme{
      omv-tailscale-startconfig-access-page{
        h1,h2,h3{
        color:$lightblue !important;
    }
       
      }

    }
    omv-tailscale-startconfig-access-page{
      #tailscale-access-form1{
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

      .omv-form-container{
        border: 1px solid $lightblue !important;
      }
      omv-form-paragraph:first-child .omv-form-paragraph {
        font-size: var(--mat-font-size-headline) !important;
        font-weight: var(--mat-font-weight-headline) !important;
       
      }

      omv-form-paragraph:not(:first-child) .omv-form-paragraph, .omv-form-container-item omv-form-paragraph .omv-form-paragraph {
        font-size: var(--mat-font-size-subheading-2) !important;
      }
      .hidden{
        display:none !important;
      }
     
      omv-intuition-form .omv-form-container{
        flex-direction:column;

      }
      omv-intuition-form .omv-form-container .omv-form-container-item{
        width:100%;
      }
      
      .omv-form-divider
      {
      
        display: flex !important;
        justify-content: flex-start!important;
        align-items: center!important;
        width: 15rem !important;
        cursor: pointer !important;
        font-size: var(--mat-font-size-subheading-2) !important;
        font-weight: var(--mat-font-weight-subheading-2) !important;
        
      }
      
      omv-form-divider{
        height: 80px !important;
      }
      
      .omv-form-divider .title{
          background-color: white!important;
          color:$lightblue!important;
          
          /*background-color:$lightblue;
          color: white;
          */
          padding: 15px 30px;
          border: 1px solid $lightblue;
          border-radius: 10px;
          font-weight: var(--mat-font-size-subheading-2) !important;
          font-size: var(--mat-font-size-subheading-2) !important;
          display: flex;
          align-items: center;
          justify-content: center;
      }
      
      .omv-form-divider .title:after {
          content: '\x5E';  /* Caret symbol */
          float: right;
          font-weight: 500;
          font-size: 25px;
          margin-left: 8px;
          transition: transform .3s ease;
          width: 20px;
          height: 20px;
          min-width: 20px;
          min-height: 20px;
          display: flex;
          border: 1px solid $lightblue;
          justify-content: center; 
          background-color: $lightblue;
          color: white;
        
          /*background-color: white;
          color: $lightblue;
          */
          border-radius: 10px;
      }
      
      /* For expanded state */
      
      .omv-form-divider.expanded .title:after {
        transform: rotate(180deg);
        background-color: white!important;
        color: $lightblue!important;

      }
      
      /* Optional: Add hover state */
      .omv-form-divider .title {
        cursor: pointer;
      }
      
      .omv-form-divider.expanded .title {
        background-color: $lightblue!important;
        color: white!important;
        border: 1px solid white!important;
        border-radius: 10px!important;
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

      @media (max-width: 768px) {
        video{
          width:100%!important;
        }
        omv-form-divider{
          height: 120px !important;
        }
      }

    
    }
    
   
  `],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation


})

export class TailscaleAccessComponent extends BaseFormPageComponent {
  public safeHtmlContent: SafeHtml;
  private htmlContent=`<h1>📲 How to Set Up Tailscale VPN on Your Access Devices</h1>
            <p>
              To use Homecloud over VPN, make sure your access device — such as your phone or laptop — is connected to the VPN. 
              It’s a simple step that keeps your connection private and secure. Follow below steps to check that.
            </p>
            <ul>
              <li>Go to <a class="plainLink" href="#/startconfiguration/vpn/status">VPN status page</a></li><br>
              <li>Verify that VPN is configured and status is <strong>"Up"</strong> on your Homecloud server.</li><br>
              <li>Verify that your access device(phone/laptop) is in the device list on this page.</li><br>
              <li>If present, your access device is connected to VPN.</li>
              <p> Note: If VPN is configured and status is <strong>"Up"</strong> on Homecloud server, all access devices should also be connected to VPN.
            </ul>

            <p>
              ⚠️ <strong>If you're not connected to the VPN</strong>, Homecloud will only be accessible on your local network.
            </p>`;
  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getTailscaleStatus'
      }
    },
    fields: [
     
      {
        type: 'divider',
        title: gettext('Set up Tailscale VPN on iOS devices'),
        name:'iOSHeader'
      },
      {
        type: 'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext('To configure on Apple iOS devices, install Tailscale VPN app:'),
            name:'paragraph4'
          },
          {
            type: 'paragraph',
            title: gettext(`<a href="https://apps.apple.com/in/app/tailscale/id1470499037" target="_blank"><img src="/assets/images/immich-ios-app-store.png" style="width:50%;margin:-1%;"/></a>`),
            name:'paragraph5'
          },
          {
            type: 'paragraph',
            title: gettext('After installing the app on your device, log in to Tailscale using the same account you used to sign up. For quick access copy ID from below:'),
            name:'paragraph6'
          },
          {
            type: 'textInput',
            name: 'user',
            label: gettext('Tailscale account ID currently logged in:'),
            hint: gettext('Only visible when Homecloud VPN status is Up. Use this to login to Tailscale app on access device.'),
            value: '',
            readonly: true
          },
          {
            type: 'paragraph',
            title: gettext('Make sure the Tailscale app is allowed to stay always connected on your device. If not, your apps might lose access to Homecloud when the connection drops in the background. See video for instructions.'),
            name:'paragraph7'
          },
          {
            type: 'paragraph',
            title: gettext(`<video playsinline controls style="width:60%;height:100%;"><source src="/assets/videos/VPN-ios-Setup.webm" type="video/webm"></video>`),
            name:'paragraph8'
          }

        ]
      },
      {
        type: 'divider',
        title: gettext('Set up Tailscale VPN on Android devices'),
        name:'androidHeader'
      },
      
      {
        type: 'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext('To configure on Android devices, install Tailscale VPN app:'),
            name:'paragraph9'
          },
          {
            type: 'paragraph',
            title: gettext(`<a class="plainLink" href="https://play.google.com/store/apps/details?id=com.tailscale.ipn"target="_blank"><img src="/assets/images/immich-google-play-badge.png" style="width:50%;"/></a>`),
            name:'paragraph10'
          },
          {
            type: 'paragraph',
            title: gettext('After installing the app on your device, log in to Tailscale using the same account you used to sign up. For quick access copy ID from below:'),
            name:'paragraph11'
          },
          {                              
            type: 'textInput',
            name: 'user',
            label: gettext('Tailscale account ID currently logged in:'),
            hint: gettext('Only visible when Homecloud VPN status is Up. Use this to login to Tailscale app on access device.'),
            value: '',
            readonly: true
          },
          {
            type: 'paragraph',
            title: gettext('Make sure the Tailscale app is allowed to stay always connected on your device. If not, your apps might lose access to Homecloud when the connection drops in the background. See video for instructions.'),
            name:'paragraph13'
          },
          {
            type: 'paragraph',
            title: gettext(`<video playsinline controls style="width:60%;height:100%;"><source src="/assets/videos/VPN-android-Setup.webm" type="video/webm"></video>`),
            name:'paragraph14'
          }

        ]
      }, 
      {
        type: 'divider',
        title: gettext('Set up Tailscale VPN on MacOS,Windows and Linux devices'),
        name:'otherHeader'
      },
      {
        type: 'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext(`For MacOS, Windows and Linux computers follow the instructions at &nbsp;&nbsp; <a class="plainLink" href="https://tailscale.com/download" target="_blank" style="width:50%;margin:-1%;">https://tailscale.com/download</a>`),
            name:'paragraph15'
          }
        ]
      },
      {
        type: 'paragraph',
        title: gettext('Repeat the above steps for all the devices you want to access Homecloud from.'),
        name:'paragraph16'
      },
      
      {
        type: 'paragraph',
        title: gettext(''),
        name:'paragraph18'
      },
      {
        type: 'paragraph',
        title: gettext(`To share Homecloud with others over VPN, you can invite users (keeping in mind the limits of the free plan) from the Tailscale admin console: <a href="https://login.tailscale.com/admin/users" class="plainLink" target="_blank">https://login.tailscale.com/admin/users</a>. They’ll get a link to join your VPN network, and once they accept, they can install the Tailscale app to access Homecloud.`),
        name:'paragraph24'
      }
    ]
  };

  constructor(private sanitizer: DomSanitizer) {
      super();
     
      // Sanitize the title 
    
          this.config.fields[1].fields[1].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[1].fields[1].title) as unknown as string;
          this.config.fields[1].fields[5].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[1].fields[5].title) as unknown as string;
          
          this.config.fields[3].fields[1].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[3].fields[1].title) as unknown as string;
          this.config.fields[3].fields[5].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[3].fields[5].title) as unknown as string;
          this.config.fields[5].fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[5].fields[0].title) as unknown as string;
          this.config.fields[8].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[8].title) as unknown as string;
        
          
          // Sanitize the HTML content once during construction
          this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    }
    
   
    ngAfterViewInit(): void {    
       
      // Delay the operation to ensure the view is fully rendered
      setTimeout(() => {
  
        // Select all paragraph elements (assuming they are rendered as `android-drive-form1 .omv-form-paragraph` elements)
          const paragraphs = document.querySelectorAll('#tailscale-access-page .omv-form-paragraph');
  
          // Inject the sanitized HTML into the correct paragraph element
          
          paragraphs[1].innerHTML =
          (this.config.fields[1].fields[1].title as any).changingThisBreaksApplicationSecurity ||
          this.config.fields[1].fields[1].title?.toString();

          paragraphs[4].innerHTML =
          (this.config.fields[1].fields[5].title as any).changingThisBreaksApplicationSecurity ||
          this.config.fields[1].fields[5].title?.toString();

          paragraphs[6].innerHTML =
          (this.config.fields[3].fields[1].title as any).changingThisBreaksApplicationSecurity ||
          this.config.fields[3].fields[1].title?.toString();

          paragraphs[9].innerHTML =
          (this.config.fields[3].fields[5].title as any).changingThisBreaksApplicationSecurity ||
          this.config.fields[3].fields[5].title?.toString();
  
          paragraphs[10].innerHTML =
          (this.config.fields[5].fields[0].title as any).changingThisBreaksApplicationSecurity ||
          this.config.fields[5].fields[0].title?.toString();

          paragraphs[13].innerHTML =
          (this.config.fields[8].title as any).changingThisBreaksApplicationSecurity ||
          this.config.fields[8].title?.toString();
  
          // Call the collapseContainers method to set up the collapsible containers
          this.collapseContainers();
       
      
      }, 100); // Timeout ensures it happens after the view has rendered
    }
    
  
    collapseContainers() {
      console.log('collapseContainers called');
      //Logic for collapsible container
      const divider = document.querySelectorAll('#tailscale-access-page omv-form-divider');
      const dividerc = document.querySelectorAll('#tailscale-access-page .omv-form-divider');
      const container = document.querySelectorAll('#tailscale-access-page .omv-form-container');
      
     
      for(let i = 0; i < divider.length; i++){
       
        if (container[i] && divider[i]) {   
          if (container[i] instanceof HTMLElement && divider[i] instanceof HTMLElement) {
            container[i].classList.add('hidden');
            
            divider[i].addEventListener('click', () => {            
              container[i].classList.toggle('hidden');
              if(dividerc[i]){
                dividerc[i].classList.toggle('expanded');
          
              }
            });
            
  
          }
        }
  
      }
      
      
     
    }   


}
