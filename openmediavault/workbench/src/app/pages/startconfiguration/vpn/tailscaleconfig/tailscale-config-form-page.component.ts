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
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { ModalDialogComponent } from '~/app/shared/components/modal-dialog/modal-dialog.component';
import { DialogService } from '~/app/shared/services/dialog.service';
import { AuthSessionService } from '~/app/shared/services/auth-session.service';


@Component({
  selector:'omv-tailscale-startconfig-page', //Home cloud changes
  template: `
            <div id="tailscale-config-form1">
                <div class="omv-form-paragraph" [innerHTML]="safeHtmlContent"></div>
            </div>
            <omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>
            `,
  styleUrls: ['./tailscale-config-form-page.component.scss'],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})


export class TailscaleConfigFormPageComponent extends BaseFormPageComponent {
  public safeHtmlContent:SafeHtml;
  private htmlContent=`<h1>🛠️ VPN Configuration</h2>
                      <p>
                        The VPN enables you to access Homecloud securely over the Internet from any location. 
                        Homecloud will only be accessible from your devices that are connected to the same VPN service and from allowed accounts.
                      </p>
                      <p>
                        ✅ <strong>If VPN status is <em>Up</em>, no action is required.</strong>
                      </p>`;
  private licenseTermsRead:boolean = false; // Flag to track if license terms are read
  private tailscaleTermsVersion:string='';
  private tailscaleTermsArray:any = [];
  public config: FormPageConfig = {
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
        label: gettext('Tailscale VPN Status'),
        hint: gettext('Up denotes VPN is configured and working. Down indicates either VPN is not configured or requires reconfiguration. Homecloud is not accessible over VPN when status is Down.'),
        value: '',
        /*
        validators: {
          patternType: 'hostName'
        },
        */
        readonly: true
      },
      {
        type: 'textInput',
        name: 'user',
        label: gettext('Tailscale account name currently logged in'),
        hint: gettext('Only visible when VPN status is Up'),
        value: '',
        /*
        validators: {
          patternType: 'email'
        },
        */
        readonly: true
      },
      {
        type: 'textInput',
        name: 'hostname',
        label: gettext('Fully qualified name on VPN'),
        hint: gettext('Use this name to access Homecloud from other devices over VPN'),
        value: '',
        /*
        validators: {
          patternType: 'hostName'
        },
        */
        readonly: true
      },
      {
        type: 'divider',
      //  title: gettext('Reconfigure'),
        title: gettext(' VPN'),
        name:'containerHeader'
      },
      {
        type:'container',
        fields:[
          {
            type: 'paragraph',
            title: gettext('Important: Changing VPN configuration will break existing connections and connected apps would need to be reconfigured.')
          },
    
          {
            type: 'paragraph',
            title: gettext('To setup/reconfigure VPN follow these steps:')
          },
          {
            type: 'paragraph',
            title: gettext(`Step 1. Sign-up for Tailscale VPN service on: <a class="plainLink" href="https://login.tailscale.com/" target="_blank">https://login.tailscale.com/</a>`)
          },
    
          {
            type: 'paragraph',
            title: gettext('Step 2. After login to Tailscale follow navigation >> Skip Introduction >> Settings >> On left navigation bar >> OAuth Clients >> Generate OAuth client >> Description. Set Description to Homecloud >> Select All scope for Read and Write >> Scroll down and press Generate client. Copy/Paste generated values to below fields.')
          },
          {
            type: 'paragraph',
            title: gettext('')
          },
          {
            type: 'paragraph',
            title: gettext('Copy/Paste generated values to below fields and press Submit button below.')
          },
          {
            type: 'textInput',
            name: 'clientid',
            label: gettext('Tailscale Client ID'),
            placeholder: gettext('Paste Client ID generated here'),
            textField: 'description',
            valueField: 'Tailscale api client id',
            suggestions:false,
            value: '',
            disabled:'false',
            validators: {
              required: true,
              custom: [
                {
                    constraint: {
                      operator: 'regex',  // Use regex to check for the backtick
                      arg0: { prop: 'clientid' },
                      arg1: '^[^`\'"]*$',  // Regular expression to ensure no backticks
                    },
                    errorData: gettext("Client Id cannot contain the backtick (`), single quote (') or double quote (\") characters.")
                }
    
              ]
            }
          },
    
          {
            type: 'textInput',
            name: 'clientsecret',
            label: gettext('Tailscale Api Client Secret'),
            placeholder: gettext('Paste Client Secret here'),
            textField: 'description',
            valueField: 'Tailscale api client secret',
            suggestions:false,
            value: '',
            disabled:'false',
            validators: {
              required: true,
              custom: [
                {
                    constraint: {
                      operator: 'regex',  // Use regex to check for the backtick
                      arg0: { prop: 'clientsecret' },
                      arg1: '^[^`\'"]*$',  // Regular expression to ensure no backticks
                    },
                    errorData: gettext("Client Secret cannot contain the backtick (`), single quote (') or double quote (\") characters.")
                }
    
              ]
            }
          },
          {
            type: 'textInput',
            name: 'tailnetname',
            label: gettext('Tailnet Name'),
            placeholder: gettext('Go to >> DNS tab and paste Tailnet name here.'),
            textField: 'description',
            valueField: 'Tailscale tailnet name',
            suggestions:false,
            value: '',
            disabled:'false',
            validators: {
              required: true,
              custom: [
                {
                    constraint: {
                      operator: 'regex',  // Use regex to check for the backtick
                      arg0: { prop: 'tailnetname' },
                      arg1: '^[^`\'"]*$',  // Regular expression to ensure no backticks
                    },
                    errorData: gettext("Tailnet name cannot contain the backtick (`), single quote (') or double quote (\") characters.")
                }
    
              ]
            }
          },
          {
            type: 'paragraph',
            title: gettext(`Step 3. Go to DNS Tab located on top of the page, scroll down till HTTPS Certificates section and press Enable HTTPS.`)
          },
          {
            type: 'checkbox',
            name: 'vpntermsFlag',
           // hint: gettext('You must agree to Tailscale terms to use this service.'),
            label: gettext(`I confirm that I have read the tailscale terms <a onclick="window.onVpnTermsClicked()" class="plainLink" href="/#/startconfiguration/vpn/terms">here</a> and agree to that`),
            autofocus: true,
            validators: {
              required: true
            },
            value:false,
            modifiers:[{type:'unchecked'}]
           
          },
          {
            type: 'paragraph',
            title: gettext('Press Submit button below.')
          },
          
          {
            type: 'paragraph',
            title: gettext(`Step 4. Configure Tailscale on your access devices - phone, computer to access Homecloud. For device specific setup instructions go to VPN >> <a class="plainLink" href="/#/startconfiguration/vpn/access">Access page</a>`)
          }

        ]
      }


    ],
    buttons: [
      {
        template: 'submit',
        text:'Submit',
        execute: {
            type: 'taskDialog',
            taskDialog: {
              config: {
                title: gettext('Message'),
                autoScroll: false,
                startOnInit: true,
                buttons: {
                  start: {
                    hidden: true
                  },
                  stop: {
                    hidden: true
                  },
                  close:{
                    hidden: false,
                    disabled: false,
                    autofocus: false,
                    dialogResult: true
                  }

                },
                request: {
                  service: 'TailscaleConfig',
                  method: 'generateAccessToken',
                  params:{
                    tailscaleClientData:{                                          
                      clientid:'{{ clientid }}',
                      clientsecret:'{{ clientsecret }}',
                      tailnetname:'{{ tailnetname }}'
                    },
                    tailscaleTermsData:this.tailscaleTermsArray


                  }

                }
              },
            successUrl:'/startconfiguration/vpn'
            }
        }
      }

    ]

  };

  constructor(private sanitizer: DomSanitizer,
                private rpcService: RpcService,
                private dialogService: DialogService,
                private authSessionService: AuthSessionService) 
  {
    super();
    // Sanitize the title 
  
    this.config.fields[4].fields[2].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[4].fields[2].title) as unknown as string;
    this.config.fields[4].fields[10].label = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[4].fields[10].label) as unknown as string;
    this.config.fields[4].fields[12].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[4].fields[12].title) as unknown as string;
    //this.config.fields[6].fields[14].title = this.sanitizer.bypassSecurityTrustHtml(this.config.fields[6].fields[14].title) as unknown as string;
   
    
    // Sanitize the HTML content once during construction
    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);


  }
  ngOnInit(){
    this.checkInternetStatus();
    this.fetchStatusAndUpdateFields();  //get hostname value and update in link
     // Make the function globally accessible
    (window as any).onVpnTermsClicked = this.onVpnTermsClicked.bind(this);
     // Check if terms have been read before
    this.licenseTermsRead = localStorage.getItem('tailscaleTermsRead') === 'true';
    //console.log('terms read',this.licenseTermsRead);
    // Restore form values from localStorage
    const clientId = localStorage.getItem('tailscale_clientid');
    const clientSecret = localStorage.getItem('tailscale_clientsecret');
    const tailnetName = localStorage.getItem('tailscale_tailnetname');
    // Update the form fields if values exist
    if (clientId) {
      const clientIdField = this.config.fields[4].fields.find(field => field.name === 'clientid');
      if (clientIdField) clientIdField.value = clientId;
    }
    
    if (clientSecret) {
      const clientSecretField = this.config.fields[4].fields.find(field => field.name === 'clientsecret');
      if (clientSecretField) clientSecretField.value = clientSecret;
    }
    
    if (tailnetName) {
      const tailnetNameField = this.config.fields[4].fields.find(field => field.name === 'tailnetname');
      if (tailnetNameField) tailnetNameField.value = tailnetName;
    }

    // Update the checkbox field's validators
    const checkboxField = this.config.fields[4].fields.find(field => field.name === 'vpntermsFlag');
    if (checkboxField) {
      // Remove the custom validator if terms have been read
      if (this.licenseTermsRead) {
        checkboxField.validators = {
          required: true
        };
        this.buildTailscaleTermsArray(); // Build the Tailscale terms array
        this.config.buttons[0].execute.taskDialog.config.request.params.tailscaleTermsData = this.tailscaleTermsArray; // Update the request params with the terms array
      } else {
        // Add a validator that prevents checking if terms haven't been read
        checkboxField.validators = {
          required: true,
          custom: [
            {
              constraint: {
                operator: 'eq',
                arg0: { value: false },  // Always validate to false if terms not read
                arg1: true
              },
              errorData: gettext('You must read the Tailscale terms before agreeing to them.')
            }
          ]
        };
      }
    }
    
  }
  fetchStatusAndUpdateFields(): void {
    this.rpcService.request('Homecloud', 'getTailscaleStatus').subscribe(response => {
      const status = response.status;
     // console.log('status',status);
      this.updateFieldColors(status);     //Update colors based on status
      this.collapseContainerWithSubmitBtn(status);     //collapse/expand container based on status
        
    });
  }
  

  collapseContainerWithSubmitBtn(status:string):void {
    //Logic for collapsible container
    const divider = document.querySelector('omv-tailscale-startconfig-page omv-form-divider');
    const dividerc = document.querySelector('omv-tailscale-startconfig-page .omv-form-divider');
    const container = document.querySelector('omv-tailscale-startconfig-page .omv-form-container');
    const submitButton = document.querySelector('omv-tailscale-startconfig-page .mat-card-actions');
    
    //Hide container by default
    if (container && divider) {   
    //if (container) {   
       if (container instanceof HTMLElement && divider instanceof HTMLElement) {
        container.classList.add('hidden');
        submitButton.classList.add('hidden');
    //   if (container instanceof HTMLElement) {
          if(status === 'Up'){
          //  container.classList.add('hidden');
          //  divider.classList.remove('hidden');
            divider.classList.remove('configure');
            divider.classList.add('reconfigure');                                                                           
      //    submitButton.classList.add('hidden');
            
          }
          else{
          //  container.classList.remove('hidden');
           // divider.classList.add('hidden');
            divider.classList.remove('reconfigure');
            divider.classList.add('configure');
      //    submitButton.classList.remove('hidden');
          }
          
        }
       // if(status === 'Up'){
          divider.addEventListener('click', () => {            
            container.classList.toggle('hidden');
            submitButton.classList.toggle('hidden');
            if(dividerc){
              dividerc.classList.toggle('expanded');
        
            }
          });

      //  }
      
    }

    
   
  } 
   


  updateFieldColors(status:string):void{
    const element = document.querySelector('omv-tailscale-startconfig-page omv-form-text-input:nth-of-type(1) .mat-form-field input');
    if(element){
      if(status === 'Up'){
        element.classList.add('greenstatus');
        element.classList.remove('redstatus');
      }else{
        element.classList.remove('greenstatus');
        element.classList.add('redstatus');
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.addcheckboxListener(); // Add listener for checkbox
      this.addInputChangeListeners(); // Add listeners for input changes
      // Select all paragraph elements 
      const paragraphs = document.querySelectorAll('omv-tailscale-startconfig-page .omv-form-container .omv-form-paragraph');
      const checkboxLabel=document.querySelector('omv-tailscale-startconfig-page .omv-form-container omv-form-checkbox .mat-checkbox-label');
      // Inject the sanitized HTML into the correct paragraph element
      
      paragraphs[2].innerHTML =
      (this.config.fields[4].fields[2].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[4].fields[2].title?.toString();
      paragraphs[8].innerHTML =
      (this.config.fields[4].fields[12].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[4].fields[12].title?.toString();
      /*paragraphs[10].innerHTML =
      (this.config.fields[6].fields[14].title as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[6].fields[14].title?.toString();
      */

      checkboxLabel.innerHTML=(this.config.fields[4].fields[10].label as any).changingThisBreaksApplicationSecurity ||
      this.config.fields[4].fields[10].label?.toString();

      document.querySelector('meta[name="viewport"]').setAttribute("content", "width=device-width, initial-scale=1.0, user-scalable=yes");
      
    }, 100);
  }

  addcheckboxListener() { 
      const checkbox = document.querySelector('omv-tailscale-startconfig-page omv-form-checkbox input[type="checkbox"]');
      const tailscaleButton = document.querySelector('omv-tailscale-startconfig-page  omv-submit-button button');
      
      if (checkbox) {
        checkbox.addEventListener('change', (event: Event) => {
          const target = event.target as HTMLInputElement;
  
          if(target.checked){
  
            if(!this.licenseTermsRead) {
              
              // Show dialog
              this.dialogService.open(ModalDialogComponent, {
                data: {
                  template: 'information',
                  title: gettext('Click on the link and read the tailscale terms'),
                  message: gettext('You must read the Tailscale terms before agreeing to them.')
                }
              });
              tailscaleButton.classList.add('mat-button-disabled'); //disable if terms not read
              
            }
            else{
              tailscaleButton.classList.remove('mat-button-disabled'); //enable if checkbox checked and terms read
            }
  
          }
          else{
            tailscaleButton.classList.add('mat-button-disabled'); //disable if checkbox not checked
          }
                  
      
        });
      }
    }
    
  
    addInputChangeListeners() {
      //console.log('Adding input change listeners');
      
      // Get the input elements by position
      const textInputs = document.querySelectorAll('omv-tailscale-startconfig-page .omv-form-container omv-form-text-input');
      
      // Client ID is the first text input (index 0)
      const clientIdInput = textInputs[0]?.querySelector('input') as HTMLInputElement;
      
      // Client Secret is the second text input (index 1)
      const clientSecretInput = textInputs[1]?.querySelector('input') as HTMLInputElement;
      
      // Tailnet Name is the third text input (index 2)
      const tailnetNameInput = textInputs[2]?.querySelector('input') as HTMLInputElement;
  
      // Add change and input event listeners to save values as they change
      if (clientIdInput) {
        clientIdInput.addEventListener('change', () => {
          localStorage.setItem('tailscale_clientid', clientIdInput.value);
        });
      }
      
      if (clientSecretInput) {
        clientSecretInput.addEventListener('change', () => {
          localStorage.setItem('tailscale_clientsecret', clientSecretInput.value);
        });
      }
      
      if (tailnetNameInput) {
        tailnetNameInput.addEventListener('change', () => {
          localStorage.setItem('tailscale_tailnetname', tailnetNameInput.value);
        });
      }
    }
    
    
    
    
  
    onVpnTermsClicked(){
    
      this.licenseTermsRead = true; // Set the flag to true when terms are read
      // Save to localStorage
      localStorage.setItem('tailscaleTermsRead', 'true');
      // Update the checkbox field's validators
      const checkboxField = this.config.fields[4].fields.find(field => field.name === 'vpntermsFlag');
      if (checkboxField) {
        // Remove the custom validator now that terms have been read
        checkboxField.validators = {
          required: true
        };
      }
      
    }
  
  
    buildTailscaleTermsArray() {
        console.log('Building Tailscale terms array');
        const username = this.authSessionService.getUsername();
        const accepted =  true;
        const acceptedDate = new Date().toISOString(); // Gets current timestamp in milliseconds
        const comment='';
        // Get the Tailscale terms version from localStorage
        this.tailscaleTermsVersion = localStorage.getItem('tailscaleTermsVersion');
        this.tailscaleTermsArray={
          'tailscaleTermsVersion':this.tailscaleTermsVersion,
          'user':username,
          'accepted':accepted,
          'accepted-date':acceptedDate,
          'comment':comment}
    }
   
    checkInternetStatus(){
     // console.log('checking internet status');
      this.rpcService.request('Homecloud', 'checkInternetStatusForWizard').subscribe(response => {
        //console.log('response',response);
        if (response.internetConnected !== true) { //Internet down
         // console.log('internet down');
          const tailscaleButton=document.querySelector('omv-tailscale-startconfig-page omv-submit-button button');
          const tailscaleCheckbox=document.querySelector('omv-tailscale-startconfig-page omv-form-checkbox');
          const tailscaleConfigContainer=document.querySelector('omv-tailscale-startconfig-page .omv-form-container');
          //console.log('tailscaleButton', tailscaleButton);
          if(tailscaleButton && tailscaleCheckbox){
                tailscaleButton.classList.add('mat-button-disabled');
               // tailscaleCheckbox.classList.add('hidden');
                tailscaleConfigContainer.classList.add('hidden');
                //tailscaleCheckbox.insertAdjacentHTML('afterend','<br><span class="internetError">Homecloud is not connected to Internet.Go to <a class="plainLink" href="#/setupwizard/networkconfig/interfaces">Network Interfaces</a> page to check the status. Connect Homecloud to Internet and try again');
                tailscaleConfigContainer.insertAdjacentHTML('afterend','<br><span class="internetError">Homecloud is not connected to Internet.Go to <a class="plainLink" href="#/setupwizard/networkconfig/interfaces">Network Interfaces</a> page to check the status. Connect Homecloud to Internet and try again');
                
          }
          
        } 
       
    });
    }
    
}
