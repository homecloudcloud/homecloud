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
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

import {
  FormPageButtonConfig,
  FormPageConfig
} from '~/app/core/components/intuition/models/form-page-config.type';
import { translate } from '~/app/i18n.helper';
import { Icon } from '~/app/shared/enum/icon.enum';
import { AuthService } from '~/app/shared/services/auth.service';
import { BlockUiService } from '~/app/shared/services/block-ui.service';
import { DialogService } from '~/app/shared/services/dialog.service';
import { LocaleService } from '~/app/shared/services/locale.service';
import { ReadFlagServiceService } from '~/app/shared/services/read-flag-service.service'; //Home cloud changes
import { AuthSessionService } from '~/app/shared/services/auth-session.service';
import {ModalDialogComponent} from '~/app/shared/components/modal-dialog/modal-dialog.component';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';



@Component({
  selector: 'omv-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
  
})
export class LoginPageComponent implements OnInit {
  public htmlContent: SafeHtml;
  public htmlContent1: SafeHtml;
  public currentLocale: string;
  public locales: Record<string, string> = {};
  public hostname:string = window.location.hostname;
  
 

  public config: FormPageConfig = {
    id: 'login',
    
    fields: [
      {
        type: 'textInput',
        name: 'username',
        label: gettext('User name'),
        autofocus: true,
        autocomplete: 'username',
        icon: Icon.user,
        validators: {
          required: true
        }
      },
      {
        type: 'passwordInput',
        name: 'password',
        label: gettext('Password'),
        icon: Icon.password,
        autocomplete: 'current-password',
        validators: {
          required: true
        }
      }

    ],
    buttonAlign: 'center',
    buttons: [
      {
        template: 'submit',
        text: gettext('Log in'),
        execute: {
          type: 'click',
          click: this.onLogin.bind(this)
        }
      }
    ]
  };
  licenseFlagVal:boolean;   //home cloud changes
  routepath:string //home cloud changes
  constructor(
    private activatedRoute: ActivatedRoute,
    private readFlagService: ReadFlagServiceService, //Home cloud changes
    private authService: AuthService,
    private blockUiService: BlockUiService,
    private dialogService: DialogService,
    private router: Router,
    private authSessionService: AuthSessionService,
    private sanitizer: DomSanitizer
    
  ) {
    this.currentLocale = LocaleService.getCurrentLocale();
    this.locales = LocaleService.getSupportedLocales();
    


  }

  ngOnInit(): void {
  
    this.blockUiService.resetGlobal();
    // Ensure all currently opened dialogs are closed.
    this.dialogService.closeAll();
    
    
    // Generate your HTML with the hostname
   this.htmlContent = `Forgot admin password?&nbsp;&nbsp;<a href="https://${this.hostname}/forgot-password/request.html" target="_blank">Click here to reset it.</a>`;
   this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent as string);

   this.htmlContent1 = `<a href="https://${this.hostname}/forgot-password/show-app-links.html" target="_blank">App Links</a>`;
   this.htmlContent1 = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent1 as string);
    
  }

  onLogin(buttonConfig: FormPageButtonConfig, values: Record<string, any>) {
    this.blockUiService.start(translate(gettext('Please wait ...')));
    this.authService
      .login(values.username, values.password)
      .pipe(
        finalize(() => {
          this.blockUiService.stop();
        })
      )
      .subscribe(() => {
        /**home cloud changes start */
        //const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', '/dashboard');
        //this.router.navigate([url]);
        this.readFlagService
        //  .readFlag('licenseFlag')
          //.readLicenseFlag(values.username)
          .readLatestLicenseFlag(values.username)
          .subscribe((response)=>{

            this.licenseFlagVal=response.flagValue;
            console.log('license flag',this.licenseFlagVal);
            if (this.licenseFlagVal == true){
              console.log('license accepted');
              //If License is accepted. 
              // Check if user is admin.
              console.log('checking admin login');
              const isAdmin = this.authSessionService.hasAdminRole();

              if(isAdmin){
                console.log('admin login');
                //check if setup is complete
                this.readFlagService.readSetUpFlags('setup_overall_flag').subscribe({
                  next:(response:any)=>{
                    if(response.flagValue === true){
                      console.log('directing to dashboard');
                      this.routepath = 'dashboard'; //admin directed to dashboard
                      const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', this.routepath);
                      this.router.navigate([url]);
                    }
                    else{
                      console.log('directing to setup wizard');
                      this.routepath = 'landing' //admin directed to setup wizard
                      const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', this.routepath);

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
                    });
                  }
                });
                //this.routepath = 'landing'
              }
              else{
                this.routepath = 'dashboard'
                const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', this.routepath);
                this.router.navigate([url]);
              }
              
            }
            else{
              console.log('license not accepted yet. Going to license page');
              //License not accepted yet, so redirect to license page
              this.routepath='license'
              const url = _.get(this.activatedRoute.snapshot.queryParams, 'returnUrl', this.routepath);
              this.router.navigate([url]);
            }

           
          }

          )

        /** home cloud changes end */



      });
  }

  onSelectLocale(locale) {
    // Update the browser cookie and reload the page.
    LocaleService.setCurrentLocale(locale);
    this.router.navigate(['/reload']);
  }

 
  
}
