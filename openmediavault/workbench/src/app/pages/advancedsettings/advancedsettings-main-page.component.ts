//Home cloud changes new component
import { Component } from '@angular/core';
//import {ActivatedRoute,Router } from '@angular/router';
//import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
//import { RpcService } from '~/app/shared/services/rpc.service';
import { ViewEncapsulation } from '@angular/core';

//import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';




@Component({
  selector: 'omv-advancedsettings-main-page',
  
  template:`<div id="mainContentHeading">
              <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
            </div>
             <omv-navigation-page></omv-navigation-page>
            `,
  styleUrls: ['./advancedsettings-main-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class AdvancedsettingsMainPageComponent extends BaseFormPageComponent {
    public safeHtmlContent:SafeHtml;
    private htmlContent=`<h1>Advanced Settings</h1>`;
  
  

  constructor(private sanitizer:DomSanitizer) { super();
    // Sanitize the HTML content once during construction
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
  }

  

  
}
