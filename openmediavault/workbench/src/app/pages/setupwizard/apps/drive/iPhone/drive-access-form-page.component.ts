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
import { DatatablePageConfig } from '~/app/core/components/intuition/models/datatable-page-config.type';
import { DomSanitizer } from '@angular/platform-browser';
import { RpcService } from '~/app/shared/services/rpc.service';
//import { Router } from '@angular/router';

@Component({
  selector:'omv-setupwizard-drive-access-page', //Home cloud changes
  template: `
  <omv-logo-header></omv-logo-header>
  <omv-intuition-form-page id="ios-drive-form1" [config]="this.config"></omv-intuition-form-page>
  <omv-intuition-form-page id="ios-drive-form2" [config]="this.config2"></omv-intuition-form-page>
  <omv-intuition-datatable-page id="ios-drive-data-form" [config]="this.config1"></omv-intuition-datatable-page>
  <omv-intuition-form-page id="ios-drive-form3" [config]="this.config3"></omv-intuition-form-page>
  <omv-intuition-form-page id="ios-drive-form4" [config]="this.config4"></omv-intuition-form-page>
  <omv-intuition-form-page id="ios-drive-form5" [config]="this.config5"></omv-intuition-form-page>
  <omv-intuition-form-page [config]="this.navconfig" id="navButtons"></omv-intuition-form-page>

  `,
  styleUrls: ['./drive-access-form-page.component.scss'],
 
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation

  
})

export class AppsDriveAccessComponent extends BaseFormPageComponent {

  private hostname: string = '';
  public config1: DatatablePageConfig = {
    stateId: '66d9d3db-2fee-11ea-8386-e3eba0cf8f79',
    autoReload: 10000,
    remoteSorting: true,
    remotePaging: true,
    sorters: [
      {
        dir: 'asc',
        prop: 'name'
      }
    ],
    store: {
      proxy: {
        service: 'Homecloud',
        get: {
          method: 'getConnectedDevicesTailscaleBg',
          task: true
        }
      }
    },
    rowId: 'name',
    columns: [
      {
        name: gettext('Device'),
        prop: 'name',
        flexGrow: 1,
        sortable: true
      },
      {
        name: gettext('OS'),
        prop: 'os',
        sortable: true,
        flexGrow: 1
      },
      {
        name: gettext('Status'),
        prop: 'status',
        flexGrow: 1,
        sortable: true
      }
    ]
  };


  public config: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext(`Drive can be accessed from Apple(iOS, iPadOS, macOS), Android, Windows and Linux devices. Before configuring Drive setup VPN on these access devices.`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`If VPN is configured correctly you should be able to see your access device in the below table. If you cannot find your device below then go to VPN configuration page.`),
        name:'paragraph1'
      },
      
    ]
  };

  public config3: FormPageConfig = {
    fields: [
      {
        type: 'paragraph',
        title: gettext(`Apple Devices:`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(``),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`When prompted, enter Drive user and password. If this link is not working go to Detailed Instructions section below.`),
        name:'paragraph2'
      }
    ]
  };

  public config4: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getTailscaleStatus'

      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext(`Android Devices: Access Drive using any app that supports network drives(SMB protocol). One such free app is File Manager Plus.`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`Install File Manager Plus from Play Store&nbsp;&nbsp; <a class="plainLink" href="https://play.google.com/store/apps/details?id=com.alphainventor.filemanager"target="_blank"><img src="/assets/images/immich-google-play-badge.png" style="width:50%;"/></a> `),
        name:'paragraph2'
      },
      {
        type: 'paragraph',
        title: gettext(`Setup: Open app. Press Remote. Add Remote location. Select SMB. Copy Host name from below and paste in Host field. Enter Drive User and password. Press OK.`),
        name:'paragraph3'
      },
      {
        type: 'textInput',
        name: 'hostname',
        label: gettext('Host'),
        hint: gettext('Hostname to access over VPN. Copy and paste as described above.'),
        value: '',
        readonly: true,
        hasCopyToClipboardButton:true
      },
      {
        type: 'paragraph',
        title: gettext(`Video instructions to setup Drive on Android:`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`<video playsinline controls style="width:100%;height:50%;"><source src="/assets/videos/DriveonAndroid.webm" type="video/webm"></video>`),
        name:'paragraph4'
      }
    ]
  };

  public config5: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getTailscaleStatus'

      }
    },
    fields: [
      {
        type: 'paragraph',
        title: gettext(`Windows Devices: Drive is mounted as Network Drive using File Explorer.`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`Open File Explorer >> Sidebar >> Network >> Press right button >> Map Network Drive`),
        name:'paragraph2'
      },
      {
        type: 'paragraph',
        title: gettext(`Enter two backward slashes followed by network name of Homecloud that can be copied from below >> Enable Reconnect at sign-in >> Connect using different credentials>> Browse >> Enter your Drive user credentials when prompted >> Select homes `),
        name:'paragraph3'
      },
      {
        type: 'textInput',
        name: 'hostname',
        label: gettext('Host'),
        hint: gettext('Network name to access Homecloud over VPN. Copy and paste as described above.'),
        value: '',
        readonly: true,
        hasCopyToClipboardButton:true
      },
      {
        type: 'paragraph',
        title: gettext(`Video instructions to setup Drive on Windows:`),
        name:'paragraph1'
      },
      {
        type: 'paragraph',
        title: gettext(`<video playsinline controls style="width:100%;height:50%;"><source src="/assets/videos/Drive_Windows.webm" type="video/webm"></video>`),
        name:'paragraph4'
      }
    ]
  };

  public config2: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getTailscaleStatus'

      }
    },
    fields: [
      {
        type: 'textInput',
        name: 'status',
        label: gettext('Homecloud VPN Status'),
        hint: gettext('Up denotes VPN is configured and working on Homecloud. Down indicates either VPN is not configured or requires reconfiguration.'),
        value: '',
        readonly: true
      },
      {
        type: 'paragraph',
        title:gettext(`If Homecloud VPN status shown above is Down then first go to: &nbsp;&nbsp;<a class="plainLink" href="/#/startconfiguration/vpn/status">Connect VPN  </a>. If VPN is not even configured then go to :&nbsp;&nbsp; <a class="plainLink" href="/#/startconfiguration/vpn/tailscaleconfig">Configure VPN  </a>`),
        name:'paragraph1'
      },
      {
        type: 'divider',
        title: gettext('Detailed Instructions'),
        name:'containerHeader'
      },
      {
        type:'container',
        fields:[   
          {
            type: 'paragraph',
            title:gettext(`Detailed setup instructions: Only if <a class="drive-btn" href="smb://homecloud/" target="_blank">Open Drive on iOS</a> link does not work then follow below steps.`),
            name:'paragraph1'
          },
          
          {
            type: 'paragraph',
            title: gettext('On iPhone you can access Homecloud Drive using a pre-installed app called Files'),
            name:'paragraph2'
          },
          {
            type: 'paragraph',
            title: gettext('Open Files app on iPhone. If you cannot find it swipe down and search.'),
            name:'paragraph3'
          },
          {
            type: 'paragraph',
            title: gettext(''),
            name:'paragraph4'
          },
          {
            type: 'paragraph',
            title: gettext('On top right corner press the three dots >> Connect to Server >> Enter smb:// followed by Fully Qualified Domain Name of homecloud that can be copy pasted from below  >> Connect As >> Registered User '),
            name:'paragraph5'
          },
          {
            type: 'textInput',
            name: 'hostname',
            label: gettext('Fully qualified domain name of Homecloud'),
            hint: gettext('Use this name to access Homecloud from other devices over VPN. Copy it and paste in above step.'),
            value: '',
            readonly: true,
            hasCopyToClipboardButton:true
          },
          {
            type: 'paragraph',
            title: gettext(''),
            name:'paragraph6'
          },
          {
            type: 'paragraph',
            title: gettext(''),
            name:'paragraph7'
          },
          {
            type: 'paragraph',
            title: gettext(''),
            name:'paragraph8'
          },
          {
            type: 'paragraph',
            title: gettext('Enter your user name and password'),
            name:'paragraph9'
          },
          {
            type: 'paragraph',
            title: gettext(''),
            name:'paragraph10'
          },
          {
            type: 'paragraph',
            title: gettext('Now you can store and access your personal data.'),
            name:'paragraph11'
          }
          ,
          {
            type: 'paragraph',
            title: gettext(`<video playsinline autoplay controls style="width:100%;height:50%;"><source src="/assets/videos/ScreenRecording_01-31-2025 18-02-37_1.webm" type="video/webm"></video>`),
            name:'paragraph12'
          }
        ]
      }
      
    ]
  };


  //constructor(private sanitizer: DomSanitizer,private rpcService: RpcService,private router:Router) {
  constructor(private sanitizer: DomSanitizer,private rpcService: RpcService) {
    super();

    
  }

  ngOnInit(){
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getTailscaleStatus').subscribe(response => {
      const status = response.status;
      console.log('status',status);
      this.updateFieldColors(status);     //Update colors based on status
      this.hostname = response.hostname; 
      console.log('hostname',this.hostname);
      //Update links with hostname
      this.config3.fields[1].title=` <a class="drive-btn" href="smb://${this.hostname}/" target="_blank">Click here to open Drive on Apple devices</a>`;
      this.config2.fields[3].fields[0].title=`Detailed setup instructions: Only if <a class="drive-btn" href="smb://${this.hostname}/" target="_blank">Open Drive on iOS</a> link does not work then follow below steps.`;
      // Sanitize the title 
      this.config3.fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config3.fields[0].title) as unknown as string;
      this.config2.fields[3].fields[0].title = this.sanitizer.bypassSecurityTrustHtml(this.config2.fields[3].fields[0].title) as unknown as string;
      this.config2.fields[3].fields[12].title = this.sanitizer.bypassSecurityTrustHtml(this.config2.fields[3].fields[12].title) as unknown as string;
      this.config2.fields[1].title = this.sanitizer.bypassSecurityTrustHtml(this.config2.fields[1].title) as unknown as string;
      this.config3.fields[1].title = this.sanitizer.bypassSecurityTrustHtml(this.config3.fields[1].title) as unknown as string;
      //this.config4.fields[5].title = this.sanitizer.bypassSecurityTrustHtml(this.config4.fields[5].title) as unknown as string;
      this.config4.fields.find(field => field.name === 'paragraph4').title = this.sanitizer.bypassSecurityTrustHtml(this.config4.fields.find(field => field.name === 'paragraph4').title) as unknown as string;
      this.config5.fields.find(field => field.name === 'paragraph4').title = this.sanitizer.bypassSecurityTrustHtml(this.config5.fields.find(field => field.name === 'paragraph4').title) as unknown as string;

      //this.config4.fields[1].title = this.sanitizer.bypassSecurityTrustHtml(this.config4.fields[1].title) as unknown as string;

      console.log('config2 fields',this.config2.fields);  //debug
      console.log('config3 fields',this.config3.fields);  //debug
      
      this.addSanitizedHtml();
      this.updateFieldVisibility(status);
    });
  }
  addSanitizedHtml(){
     // Select all paragraph elements (assuming they are rendered as `ios-drive-form1 omv-form-paragraph` elements)

            
    // Select all paragraph elements (assuming they are rendered as `ios-drive-form2 omv-form-paragraph` elements)
    const paragraphs2 = document.querySelectorAll('#ios-drive-form2 .omv-form-paragraph');
    
    //console.log('paragraphs2',paragraphs2); //debug

    // Inject the sanitized HTML into the correct paragraph element
    paragraphs2[0].innerHTML =
    (this.config2.fields[1].title as any).changingThisBreaksApplicationSecurity ||
    this.config2.fields[1].title?.toString();

    paragraphs2[1].innerHTML =
    (this.config2.fields[3].fields[0].title as any).changingThisBreaksApplicationSecurity ||
    this.config2.fields[3].fields[0].title?.toString();
    paragraphs2[12].innerHTML =
    (this.config2.fields[3].fields[12].title as any).changingThisBreaksApplicationSecurity ||
    this.config2.fields[3].fields[12].title?.toString();

    const paragraphs3 = document.querySelectorAll('#ios-drive-form3 .omv-form-paragraph');
    console.log('paragraphs3',paragraphs3); //debug

    // Inject the sanitized HTML into the correct paragraph element
    paragraphs3[0].innerHTML =
    (this.config3.fields[0].title as any).changingThisBreaksApplicationSecurity ||
    this.config3.fields[0].title?.toString();

    paragraphs3[1].innerHTML =
    (this.config3.fields[1].title as any).changingThisBreaksApplicationSecurity ||
    this.config3.fields[1].title?.toString();

    const paragraphs4 = document.querySelectorAll('#ios-drive-form4 .omv-form-paragraph');

    paragraphs4[1].innerHTML =
    (this.config4.fields[1].title as any).changingThisBreaksApplicationSecurity ||
    this.config4.fields[1].title?.toString();


    paragraphs4[4].innerHTML =
    (this.config4.fields[5].title as any).changingThisBreaksApplicationSecurity ||
    this.config4.fields[5].title?.toString();

    paragraphs4[4].innerHTML =
    (this.config5.fields[5].title as any).changingThisBreaksApplicationSecurity ||
    this.config5.fields[5].title?.toString();

  }

  updateFieldVisibility(status:string):void{
    const upContainer = document.querySelector('#ios-drive-form2 .omv-form-container');
    const downElement = document.querySelector('#ios-drive-form2 omv-form-paragraph:nth-of-type(1)');
    const iosForm1 =document.querySelector('#ios-drive-form1');
    const iosForm3 =document.querySelector('#ios-drive-form3');
    const iosDriveDataForm =document.querySelector('#ios-drive-data-form');
    const divider = document.querySelector('#ios-drive-form2 omv-form-divider');
    const dividerc = document.querySelector('#ios-drive-form2 .omv-form-divider');
    
    
    console.log('upContainer', upContainer);//debug
    console.log('downElement', downElement);//debug
    console.log('iosForm1', iosForm1);//debug
    console.log('iosDriveDataForm', iosDriveDataForm);//debug
    console.log('divider', divider);//debug
    

      if(status === 'Up'){
        if(upContainer instanceof HTMLElement){
          upContainer.classList.add('hidden');  //Hide container by default
        }
        if(divider instanceof HTMLElement){
          divider.classList.remove('hidden');
        }
        if(iosForm1 instanceof HTMLElement && iosDriveDataForm instanceof HTMLElement){
          iosForm1.classList.remove('hidden');
          iosDriveDataForm.classList.remove('hidden');
        }
        if(downElement instanceof HTMLElement){
          downElement.classList.add('hidden');
        }

        //Logic for collapsible container
        if (divider && upContainer) {
          divider.addEventListener('click', () => {
            if (upContainer instanceof HTMLElement) {
              upContainer.classList.toggle('hidden');
              if(dividerc){
                dividerc.classList.toggle('expanded');     
              }
            }
          });
        }
        
      }else{
        if(upContainer instanceof HTMLElement){
          upContainer.classList.add('hidden');
        }
        if(downElement instanceof HTMLElement){
          downElement.classList.remove('hidden');
        }
        if(iosForm1 instanceof HTMLElement && iosForm3 instanceof HTMLElement &&iosDriveDataForm instanceof HTMLElement){
          iosForm1.classList.add('hidden');
          iosForm3.classList.add('hidden');
          iosDriveDataForm.classList.add('hidden');
        }
        if(divider instanceof HTMLElement){
          divider.classList.add('hidden');
        } 
    }


  }


  updateFieldColors(status:string):void{
    const element = document.querySelector('#ios-drive-form2 omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element instanceof HTMLElement){
      if(status === 'Up'){
        element.classList.add('greenstatus');
        element.classList.remove('redstatus');
      }else{
        element.classList.remove('greenstatus');
        element.classList.add('redstatus');
      }
    }
  }
  public navconfig: FormPageConfig = {

    fields:[
      
    ],
    buttons: [
      
      {template:'submit',
        text:'<< Go Back: Drive Set Up',
        execute:
        {
          type:'url',
          url:'/setupwizard/apps/drive'
        }
        
      }
    ]


  };
  ngAfterViewInit(): void {    
       
    // Delay the operation to ensure the view is fully rendered
    setTimeout(() => {

      this.enableNavButtons();

     
     
    
    }, 100); // Timeout ensures it happens after the view has rendered
  }
  
  enableNavButtons() {

    const buttons = document.querySelectorAll('omv-setupwizard-drive-access-page #navButtons omv-submit-button button');
    // Loop through all buttons and remove disabled class
    buttons.forEach(button => {
     if (button.classList.contains('mat-button-disabled')) {
       button.classList.remove('mat-button-disabled');
       button.removeAttribute('disabled');
     }
   });

  }
}


