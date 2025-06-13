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

@Component({
  template: `<omv-logo-header></omv-logo-header>
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>
            `,        
  styleUrls: ['./setupwizard.scss'],
  encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
  selector:'omv-setupwizard-page',  //Home cloud changes
})
export class SetupWizardComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    
    fields: [
     {
        type:'paragraph',   
        title: gettext('This wizard will help you configure your Homecloud.')
     },
     {
        type:'paragraph',   
        title: gettext('Connect your Homecloud to your router via LAN Cable.')
     },
     {
        type:'paragraph',   
        /*title: gettext(`<img src="/assets/images/networkCable.jpg" alt="LAN"></img>`)*/
        title: gettext(' ')
     },
     {
        type:'paragraph',   
        title: gettext('If you want to use Wifi instead, you can configure it in the next step.')
     },
     {
        type:'paragraph',   
        title: gettext('Please note that Wifi Connection may be unstable.')
     }
    ]
  };
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {
        template:'submit',
        text:'Next: Interfaces >',
        execute: {
          type: 'url',
          url: '/setupwizard/networkconfig/interfaces'
        }
      }
    ]

  };
  constructor(private sanitizer: DomSanitizer) {
      super();
     
      // Sanitize the title 
    
          this.config.fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[2].title) as unknown as string;
         
     
      
    }
    
    ngAfterViewInit(): void {    
       
      // Delay the operation to ensure the view is fully rendered
      setTimeout(() => {
  
        // Select all paragraph elements 
          const paragraphs = document.querySelectorAll('omv-setupwizard-page #mainContent .omv-form-paragraph');
  
          // Inject the sanitized HTML into the correct paragraph element
          
          paragraphs[2].innerHTML =
          (this.config.fields[2].title as any).changingThisBreaksApplicationSecurity ||
          this.config.fields[2].title?.toString();
  
  
      }, 100); // Timeout ensures it happens after the view has rendered

      document.querySelector('meta[name="viewport"]').setAttribute("content", "width=device-width, initial-scale=1.0, user-scalable=yes");

    }


  
}
