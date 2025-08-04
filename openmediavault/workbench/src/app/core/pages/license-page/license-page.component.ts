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
/***Home cloud changes new component */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { AuthSessionService } from '~/app/shared/services/auth-session.service';
//import { finalize } from 'rxjs/operators';

import {
  FormPageButtonConfig,
  FormPageConfig
} from '~/app/core/components/intuition/models/form-page-config.type';
//import { translate } from '~/app/i18n.helper';
//import { Icon } from '~/app/shared/enum/icon.enum';
//import { AuthService } from '~/app/shared/services/auth.service';
import { BlockUiService } from '~/app/shared/services/block-ui.service';
import { DialogService } from '~/app/shared/services/dialog.service';
import { LocaleService } from '~/app/shared/services/locale.service';
import { SaveFlagsServiceService } from '../../../shared/services/save-flags-service.service';
import { ModalDialogComponent } from '~/app/shared/components/modal-dialog/modal-dialog.component';
import { ReadLicenseTextServiceService } from '~/app/shared/services/read-license-text-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReadFlagServiceService } from '~/app/shared/services/read-flag-service.service';
import { ViewEncapsulation } from '@angular/core';



@Component({
  selector: 'omv-license-page',
  templateUrl: './license-page.component.html',
  styleUrls: ['./license-page.component.scss'],
  encapsulation: ViewEncapsulation.None,  // This will disable view encapsulation
  //standalone: true
})
export class LicensePageComponent implements OnInit {
  public currentLocale: string;
  public locales: Record<string, string> = {};
  public safeHtml: SafeHtml;
  private licenseVersion: string;

  public config: FormPageConfig = {
    id: 'licenseFlag',
    fields: [
    
      {
        type:'paragraph',
        title:''
      },

      {
        type: 'checkbox',
        name: 'licenseFlag',
        label: gettext('I have read the above and accept it'),
        autofocus: true,
        validators: {
          required: true
        },
        value:false,
        modifiers:[{type:'unchecked'}]

      }

    ],
    buttonAlign: 'center',
    buttons: [
      {
        template: 'submit',
        text: gettext('Proceed'),
        execute: {
          type: 'click',
          click: this.onSubmit.bind(this)
        }
      }
    ]
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private saveFlagService: SaveFlagsServiceService,
    private readFlagService: ReadFlagServiceService,
    private readLicenseTextService:ReadLicenseTextServiceService,
    private blockUiService: BlockUiService,
    private dialogService: DialogService,
    private router: Router,
    private authSessionService:AuthSessionService,
    private sanitizer: DomSanitizer
  ) {
    this.currentLocale = LocaleService.getCurrentLocale();
    this.locales = LocaleService.getSupportedLocales();
  }

  ngOnInit(): void {
    this.blockUiService.resetGlobal();
    // Ensure all currently opened dialogs are closed.
    this.dialogService.closeAll();
    this.getLicenseDetails();
  }
  private getLicenseDetails(): void {
    this.readLicenseTextService.readLicenseText()
      .subscribe({
        next: (response: any) => {
          this.licenseVersion=response.licenseVersion; //get license version
          //Sanitizing HTML
            this.config.fields[0].value=response.licenseText;
            console.log(this.config.fields[0].value);
            this.config.fields[0].value=this.sanitizer.bypassSecurityTrustHtml(this.config.fields[0].value) as unknown as string;
            console.log(this.config.fields[0].value);

            const textarea = document.querySelector('#licenseFlag .omv-form-paragraph');
            if (textarea) {
                textarea.innerHTML=(this.config.fields[0].value as any).changingThisBreaksApplicationSecurity || this.config.fields[0].value?.toString();
            }
        },
        error: (error: any) => {
          console.error('Error fetching license details:', error);
          this.dialogService
          .open(ModalDialogComponent,{
            data:{
              template: 'error',
              title: gettext('Error'),
              message: gettext('An error occurred while fetching the license details.')
            }       
          }
          );
        }

      });
  }

  onSubmit(buttonConfig: FormPageButtonConfig, values: Record<string, any>) {
    //this.blockUiService.start(translate(gettext('Please wait ...')));

    const textarea = document.querySelector('#licenseFlag .omv-form-paragraph') as HTMLTextAreaElement;

    // If textarea is not scrolled to bottom, show warning and return
    if (!textarea || !this.isTextareaAtBottom(textarea)) {
      
      this.dialogService
      .open(ModalDialogComponent,{
        data:{
          template: 'information',
          title: gettext('Read the entire license agreement'),
          message: gettext('Please read the entire license agreement before proceeding.')
        }       
      }
      );
      return;
    }

   
    if(values.licenseFlag == true){
      const username = this.authSessionService.getUsername();
      const isAdmin = this.authSessionService.hasAdminRole();
      const accepted=values.licenseFlag
      const acceptedDate = new Date().toISOString(); // Gets current timestamp in milliseconds
      const comment='';
      const licenseArray={
        'licenseVersion':this.licenseVersion,
        'user':username,
        'accepted':accepted,
        'accepted-date':acceptedDate,
        'comment':comment}

     
      this.saveFlagService.saveLicenseFlag(licenseArray)
      /*.pipe(
              finalize(() => {
                this.blockUiService.stop();
              })
      )
      */
      .subscribe({
        next: (response:any) => {
          if (!isAdmin) {
            this.router.navigate(['/dashboard']); //non admin directed to dashboard
          } 
          else {
            //check if setup is complete
            this.readFlagService.readSetUpFlags('setup_overall_flag').subscribe({
              next:(response:any)=>{
                if(response.flagValue == true){
                  const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', '/dashboard');//admin directed to dashboard
                  this.router.navigate([url]); 
                }
                else{
                  const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', '/landing'); //admin directed to setup wizard
                  this.router.navigate([url]); 
                }
                
              },
              error:(error:any)=>{
                this.dialogService
                .open(ModalDialogComponent,{
                  data:{
                    template: 'error',
                    title: gettext('Error'),
                    message: gettext('An error occurred while reading the setup flag.')
                  }
                }
                );
              }
            });
            //const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', '/landing');
            //this.router.navigate([url]); //admin directed to setup wizard landing page
          }
        },
        error:(error:any)=>{
          
          this.dialogService
          .open(ModalDialogComponent,{
            data:{
              template: 'error',
              title: gettext('Error'),
              message: gettext('An error occurred while saving the license flag.')
            }       
          }
          );
        }
       
        
      });
      

    }


  }


  /*ngAfterViewInit() {
    setTimeout(() => {
      const textarea = document.querySelector('#licenseFlag .omv-form-paragraph');
      if (textarea) {
        
        textarea.scrollTop = 0;  // Set initial scroll position to top

        // Add scroll event listener. Enabled  only when scrolled to bottom
        textarea.addEventListener('scroll', () => {
          const isAtBottom = this.isTextareaAtBottom(textarea as HTMLTextAreaElement);
          // Update checkbox state
          const checkboxField = this.config.fields.find(field => field.name === 'licenseFlag');
          if (checkboxField) {
            if (isAtBottom) {
              checkboxField.modifiers = [];
            } else {
              checkboxField.modifiers = [{ type: 'unchecked' }];
            }
          }
        });
      }
    }, 100);
  }
  */
 
  //Check if textarea scrolled to bottom
  private isTextareaAtBottom(textarea: HTMLTextAreaElement): boolean {
    return Math.abs((textarea.scrollHeight - textarea.scrollTop) - textarea.clientHeight) <= 1;
  }

  
}
