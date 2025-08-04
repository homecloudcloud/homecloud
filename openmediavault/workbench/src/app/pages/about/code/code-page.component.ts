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
  selector: 'omv-code-page',
  //templateUrl: './about-page.component.html',
  template:`
             <div id="mainContent">
              <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
            </div>
            
             `,
  styleUrls: ['./code-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class CodePageComponent extends BaseFormPageComponent {
  public safeHtmlContent:SafeHtml;
  private htmlContent=`<h1>Homecloud Code & Developer Resources</h1>
                      <p>At Libernest Technologies Pvt. Ltd., we believe in the power of open-source collaboration and transparency. Homecloud is more than just a product; it is a foundation built on well-established open-source projects, enhanced by our custom innovations. We are proud to share our work with the community.</p>
                      <p>This page serves as your gateway to the Homecloud source code, offering insights into our development, inviting contributions, and fostering a collaborative environment.</p>
                      <p><h3><b>Our GitHub Repository:</b></h3>The Heart of Homecloud Code</p>
                      <p>All our specific customizations and enhancements for the Homecloud product are publicly available and actively developed on GitHub</p>
                      <p>Explore the Homecloud Source Code Here:</p>
                      <p><a class="plainLink" target="_blank" href="https://github.com/homecloudcloud/homecloud"><strong>https://github.com/homecloudcloud/homecloud</strong></a></p>` ;

 
    

  constructor(private sanitizer: DomSanitizer) { 
    super();
      // Sanitize the HTML content once during construction
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    
  }

 
}
