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
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '~/app/shared/services/notification.service';
import { NotificationType } from '~/app/shared/enum/notification-type.enum';
import { ViewEncapsulation } from '@angular/core';



@Component({
  selector:'omv-tailscale-page', //Home cloud changes
  template: '<omv-intuition-form-page [config]="this.config"></omv-intuition-form-page>',
  //styleUrls: ['../../../../scss/homecloud.scss'],
  styles: [`
    .omv-form-paragraph {
      font-size: var(--mat-font-size-subheading-2) !important;
    }

    omv-intuition-form omv-form-paragraph:nth-of-type(6) .omv-form-paragraph
    {
      content: url('^./assets/images/networkCable.jpg');
      background-size: cover;
      background-position: center;
      width: 40%;
      height: 40%;

    }

  `],
  encapsulation: ViewEncapsulation.None  // This will disable view encapsulation
})


export class TailscaleConfigFormPageComponent extends BaseFormPageComponent {
  private notificationTitle: string = '';
  constructor(
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit() {

    // Subscribe to route data changes
    this.route.data.subscribe(data => {
      if (data && data['notificationTitle']) {
        this.notificationTitle = data['notificationTitle'];
      }
    });
  }

 onSubmitSuccess(): void {
    // Call parent method if needed


    // Show notification
    console.log('In onSubmitSuccess');
    const message = this.notificationTitle || gettext('Tailscale Configured Successfully');
    this.notificationService.show(
      NotificationType.success,
      message
    );
  }

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
        type: 'divider',
        title: gettext(' ')
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
        type: 'divider',
        title: gettext(' ')
      },
      {
        type: 'textInput',
        name: 'hostname',
        label: gettext('Fully qualified name on VPN'),
        hint: gettext('Use this name to access Homecloud from other devices over VPN'),
        value: '',
        readonly: true
      },
      {
        type: 'divider',
        title: gettext(' ')
      },
      {
        type: 'paragraph',
        title: gettext('VPN enables you to access Homecloud securely over Internet from any location. Homecloud would be accessible only from your devices that are connected to the same VPN service.')
      },
      {
        type: 'divider',
        title: gettext(' ')
      },

      {
        type: 'paragraph',
        title: gettext('To setup VPN follow these steps:')
      },
      {
        type: 'paragraph',
        title: gettext(' Step 1. Sign-up for Tailscale VPN service on: https://login.tailscale.com/')
      },

      {
        type: 'paragraph',
        title: gettext('Step 2. Configure Homecloud to connect to Tailscale VPN: Post login to Tailscale >> Skip Introduction >> Settings >> On left navigation bar >> OAuth Clients >> Generate OAuth client >> Description = Homecloud >> Select All scope for Read and Write >> Scroll down and press Generate client.')
      },
      {
        type: 'divider',
        title: gettext(' ')
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
        type: 'divider',
        title: gettext(' ')
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
        type: 'divider',
        title: gettext(' ')
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
        title: gettext('Step 3. Configure Tailscale on your phone, computers to access Homecloud from anywhere. Device specific setup instructions available at Tailscale website https://tailscale.com/')
      },
      {
        type: 'paragraph',
        title: '',
        name:'tailscaleImgField',

      },

    ],
    buttons: [
      {
        template: 'submit',
        text:'Setup Tailscale VPN',
        execute: {
            type: 'taskDialog',
            taskDialog: {
              config: {
                title: gettext('Setting up Tailscale VPN'),
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
                showCompletion:true,
                request: {
                  service: 'TailscaleConfig',
                  method: 'generateAccessToken',
                  params:{
                    clientid:'{{ clientid }}',
                    clientsecret:'{{ clientsecret }}',
                    tailnetname:'{{ tailnetname }}'


                  }

                }

              },
              successUrl:'/startconfiguration/tailscaleconfig'
            }
        }
      }


    ]

  };
}
