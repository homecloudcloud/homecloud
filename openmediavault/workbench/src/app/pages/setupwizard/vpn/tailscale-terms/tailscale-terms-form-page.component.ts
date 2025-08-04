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
import { RpcService } from '~/app/shared/services/rpc.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from '~/app/shared/services/dialog.service';
import { ModalDialogComponent } from '~/app/shared/components/modal-dialog/modal-dialog.component';


@Component({
  selector:'omv-tailscale-setupwizard-terms-page', //Home cloud changes
  template: `<omv-logo-header></omv-logo-header>
            <div id="mainContainer">
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
            </div>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>`,
  styleUrls: ['./tailscale-terms-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})


export class TailscaleTermsFormPageComponent extends BaseFormPageComponent {
  public config: FormPageConfig = {
    
    fields: [

        {
          type: 'paragraph',
          title: ''
        }
        ]
      

  };

  constructor(private sanitizer: DomSanitizer,
              private rpcService: RpcService,
              private dialogService: DialogService){
    super();
    // Sanitize the title 
  
    this.config.fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[0].title) as unknown as string;
    

  }
  ngOnInit(){
    this.getTailscaleTerms();  //get hostname value and update in link
  }
  private getTailscaleTerms(): void {
    this.rpcService.request('Flags','getTailscaleTerms',{})
        .subscribe({
          next: (response: any) => {

            //Get tailscale terms version and save to Local storage
            localStorage.setItem('tailscaleTermsVersion', response.tailscaleTermsVersion);
            
            //Sanitizing HTML
              this.config.fields[0].value=response.tailscaleTermsText;
              this.config.fields[0].value=this.sanitizer.bypassSecurityTrustHtml(this.config.fields[0].value) as unknown as string;
            
              const textarea = document.querySelector('omv-tailscale-setupwizard-terms-page .omv-form-paragraph');
              if (textarea) {
                  textarea.innerHTML=(this.config.fields[0].value as any).changingThisBreaksApplicationSecurity || this.config.fields[0].value?.toString();
              }
          },
          error: (error: any) => {
            console.error('Error fetching tailscale terms:', error);
            this.dialogService
            .open(ModalDialogComponent,{
              data:{
                template: 'error',
                title: gettext('Error'),
                message: gettext('An error occurred while fetching the tailscale terms.')
              }       
            }
            );
          }
  
        });
    }

  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'<< Go Back: VPN Set Up',
        execute:
        {
          type:'url',
          url:'/setupwizard/vpn/tailscaleconfig'
        }
        
      }
    
    ]
  };
 
  ngAfterViewInit() {
    setTimeout(() => {
      this.enableNavButtons();
    },100);
  }
  
  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-tailscale-setupwizard-terms-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }


}
