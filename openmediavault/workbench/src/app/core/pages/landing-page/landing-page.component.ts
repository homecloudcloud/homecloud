//Home cloud changes new component
import { Component } from '@angular/core';
import {ActivatedRoute,Router } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';
import { RpcService } from '~/app/shared/services/rpc.service';
import { ViewEncapsulation } from '@angular/core';

import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';




@Component({
  selector: 'omv-landing-page',
  //templateUrl: './landing-page.component.html',
  template:`<omv-logo-header></omv-logo-header>
             <omv-intuition-form-page [config]="this.config" id="mainContent"></omv-intuition-form-page>
             <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>
             `,
  styleUrls: ['./landing-page.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class LandingPageComponent extends BaseFormPageComponent {

  buttonTitle: string = 'Configure';  // Default title
  url: string = '';

  
  public config: FormPageConfig = {

    request: {
      service: 'Homecloud',
      get: {
        method: 'getSysInfo'
      } 
    },
    fields: [
      {
        type:'paragraph',   
        title: gettext('Welcome To Homecloud')
      },
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
      }
    ]
    };
    public navconfig: FormPageConfig = {

      fields:[
        
      ],
      buttons: [
        
        {
          template:'submit',
          text:this.buttonTitle,
          execute:{
            type:'click',
            click:this.gotoWizard.bind(this)
          }
        }
       
      ]
    };

  constructor(private activatedRoute: ActivatedRoute,private router: Router, private rpcService:RpcService) { super();}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.getLastCompletedStep();
  }

  gotoWizard(){
    
      this.router.navigate([this.url]);
  
  }

  getLastCompletedStep(){
      this.rpcService.request('Flags', 'readLastCompletedStep')
      .subscribe({
        next: (result: any) => {
          const urlMap = {
            network: '/setupwizard/vpn/tailscaleconfig',
            vpn: '/setupwizard/datetime',
            datetime: '/setupwizard/notificationsettings',
            notification: '/setupwizard/apps/drive',
            appsDrive: '/setupwizard/apps/photos',
            appsPhotos: '/setupwizard/apps/paperless',
            appsPaperless: '/setupwizard/apps/notes',
            appsNotes: '/setupwizard/apps/password-manager',
            appsPasswordManager: '/setupwizard/apps/media',
            appsMedia: '/setupwizard/complete',
            complete: '/dashboard',
            default: '/setupwizard'
          };
        
          this.url = _.get(
              this.activatedRoute.snapshot.queryParams, 
              'returnUrl', 
              urlMap[result?.['lastCompletedStepName']] || urlMap.default
          );
          console.log('url', this.url);
          this.buttonTitle = this.url === '/setupwizard' ? 'Start Configuration' : 'Continue Configuration';
          console.log('buttonTitle', this.buttonTitle);
        },
        error: () => {
          // Set default button title if RPC fails
          this.buttonTitle = 'Start Configuration';
        }
      }); 
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    console.log('buttonTitle:',this.buttonTitle);
    setTimeout(() => {
      this.enableNavButtons();
      //if (this.buttonTitle === 'Configure') {
        this.navconfig.buttons[0].text=this.buttonTitle;
        const configureButtonText=document.querySelector('omv-landing-page #navButtons button .mat-button-wrapper') as HTMLElement;
        configureButtonText.innerText=this.navconfig.buttons[0].text;
     // }
    }, 100);
  }

  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-landing-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
    
}
