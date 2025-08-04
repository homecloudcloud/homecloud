//Home cloud changes new component
import { Component } from '@angular/core';
//import {ActivatedRoute,Router } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
//import { RpcService } from '~/app/shared/services/rpc.service';
import { ViewEncapsulation } from '@angular/core';

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { ReadLicenseTextServiceService } from '~/app/shared/services/read-license-text-service.service';
import { ModalDialogComponent } from '~/app/shared/components/modal-dialog/modal-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from '~/app/shared/services/dialog.service';





@Component({
  selector: 'omv-licenses-page',
  //templateUrl: './about-page.component.html',
  template:`
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
            
             `,
  styleUrls: ['./licenses-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class LicensesPageComponent extends BaseFormPageComponent {

  private licenseVersion: string;
  public config: FormPageConfig = {

   /* request: {
      service: 'Flags',
      get: {
        method: 'readLicenseText'
      } 
    },
    */
    fields: [
      {
        type:'paragraph',   
        title: gettext(''),
        name:'licenseText',
        value:'',
        readonly:true
      }
    ]
    };
    

  constructor(private readLicenseTextService:ReadLicenseTextServiceService,
              private sanitizer:DomSanitizer,
              private dialogService: DialogService)
               { super();}

  ngOnInit(): void {
      
      this.getLicenseDetails();
    }
    private getLicenseDetails(): void {
      this.readLicenseTextService.readLicenseText()
        .subscribe({
          next: (response: any) => {
            this.licenseVersion=response.licenseVersion; //get license version
            console.log('license version:',this.licenseVersion);
            //Sanitizing HTML
              this.config.fields[0].value=response.licenseText;
              //console.log(this.config.fields[0].value); 
              this.config.fields[0].value=this.sanitizer.bypassSecurityTrustHtml(this.config.fields[0].value) as unknown as string;
              //console.log(this.config.fields[0].value);
  
              const textarea = document.querySelector('omv-licenses-page .omv-form-paragraph');
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

  

  
}
