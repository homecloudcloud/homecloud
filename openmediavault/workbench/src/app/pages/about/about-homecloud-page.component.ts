//Home cloud changes new component
import { Component } from '@angular/core';
//import {ActivatedRoute,Router } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
//import { RpcService } from '~/app/shared/services/rpc.service';
import { ViewEncapsulation } from '@angular/core';

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';




@Component({
  selector: 'omv-about-homecloud-page',
  //templateUrl: './about-page.component.html',
  template:`<div id="mainContentHeading">
              <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
            </div>
            <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             <omv-navigation-page></omv-navigation-page>
            `,
  styleUrls: ['./about-homecloud-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class AboutHomecloudPageComponent extends BaseFormPageComponent {
    public safeHtmlContent:SafeHtml;
    private htmlContent=`<h1>About Your Homecloud</h1>`;
  
  public config: FormPageConfig = {

    request: {
      service: 'Homecloud',
      get: {
        method: 'getSysInfo'
      } 
    },
    fields: [
      
      {
        type:'textInput',
        label:gettext('Serial Number'),
        name:'serial_number',
        value: '',   
        readonly:true
      },
    
      {
        type:'textInput',
        label:gettext('Storage Capacity'),
        name:'storage',
        value:'',   
        readonly:true
      },
      {
        type:'textInput',
        label:gettext('Total Memory'),
        name:'total_memory',
        value:'',   
        readonly:true
      },
      {
        type:'textInput',
        label:gettext('CPU Cores'),
        name:'cpu_cores',
        value:'',   
        readonly:true
      },
      {
        type:'textInput',
        label:gettext('Warranty Status'),
        name:'warranty_status',
        value:'',   
        readonly:true
      },
      {
      type:'textInput',
      label:gettext('Hardware Version'),
      name:'hardware_version',
      value:'',   
      readonly:true
      },
      {
        type:'textInput',
        label:gettext('Software Version'),
        name:'software_version',
        value:'',   
        readonly:true
      }
    ]
    };
    

  constructor(private sanitizer:DomSanitizer) { super();
    // Sanitize the HTML content once during construction
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }

  

  
}
