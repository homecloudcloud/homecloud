import { Component } from '@angular/core';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import { FormPageConfig } from '~/app/core/components/intuition/models/form-page-config.type';
import { BaseFormPageComponent } from '~/app/pages/base-page-component';

@Component({
  template: `<omv-intuition-form-page [config]="config"></omv-intuition-form-page>`
})
export class AppsUrbackupCloudstorageDisplayComponent extends BaseFormPageComponent {

  public config: FormPageConfig = {
    request: {
      service: 'Homecloud',
      get: {
        method: 'getJuicefsServiceStatus'
      }
    },

    fields: [
      {
        type: 'paragraph',
        title: gettext(
          'Configure public cloud storage of your choice to store backups. Once configured go to UrBackup management console > Settings > Backup Storage Path and set it to /backups-cloud.'
        ),
        name: 'intro_paragraph'
      },

      { type: 'divider' },

      {
        type: 'textInput',
        name: 'connection_status',
        label: gettext('Connection Status'),
        readonly: true
      },

      {
        type: 'textInput',
        name: 'storage_size_gb',
        label: gettext('Cloud Storage Capacity Used (GB)'),
        readonly: true,
        modifiers: [
          {
            type: 'value',
            typeConfig: '{{ storage_size_gb }}'
          }
        ]
      },

      {
        type: 'textInput',
        name: 'bucket_url',
        label: gettext('Bucket URL'),
        readonly: true
      },

      { type: 'divider' },

      {
        type: 'paragraph',
        title: gettext(
          'To configure or update settings edit the fields below and press Validate or Configure.'
        ),
        name: 'config_paragraph'
      },

      {
        type: 'textInput',
        name: 'access_key',
        label: gettext('Access Key'),
        hint: gettext('S3 Access Key'),
        validators: { required: true }
      },

      {
        type: 'textInput',
        name: 'secret_key',
        label: gettext('Secret Key'),
        hint: gettext('S3 Secret Key'),
        validators: { required: true }
      },

      {
        type: 'textInput',
        name: 's3_url',
        label: gettext('S3 URL'),
        hint: gettext('S3 endpoint URL'),
        validators: { required: true }
      }
    ],

    buttons: [
      {
        text: gettext('Validate'),
        submit: true,
        class: 'omv-background-color-pair-primary',
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Validating S3 Credentials'),
              autoScroll: true,
              startOnInit: true,
              buttons: {
                start: { hidden: true },
                stop: { hidden: true },
                close: {
                  hidden: false,
                  disabled: false,
                  dialogResult: true
                }
              },
              request: {
                service: 'Homecloud',
                method: 'juicefs_validate_s3_credentials',
                params: {
                  access_key: '{{ access_key }}',
                  secret_key: '{{ secret_key }}',
                  s3_url: '{{ s3_url }}'
                }
              }
            }
          }
        }
      },

      {
        text: gettext('Configure Object Storage'),
        submit: true,
        class: 'omv-background-color-pair-primary',
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Cloud Storage Configuration'),
              autoScroll: true,
              startOnInit: true,
              buttons: {
                start: { hidden: true },
                stop: { hidden: true },
                close: {
                  hidden: false,
                  disabled: false,
                  dialogResult: true
                }
              },
              request: {
                service: 'Homecloud',
                method: 'juicefs_deploy_and_configure',
                params: {
                  access_key: '{{ access_key }}',
                  secret_key: '{{ secret_key }}',
                  s3_url: '{{ s3_url }}'
                }
              }
            },
          successUrl:'/startconfiguration/apps/urbackup/access'
          }
        }
      },

      {
        text: gettext('Disconnect'),
        submit: true,
        class: 'omv-background-color-pair-primary',
        execute: {
          type: 'taskDialog',
          taskDialog: {
            config: {
              title: gettext('Disconnecting Cloud Storage'),
              autoScroll: true,
              startOnInit: true,
              buttons: {
                start: { hidden: true },
                stop: { hidden: true },
                close: {
                  hidden: false,
                  disabled: false,
                  dialogResult: true
                }
              },
              request: {
                service: 'Homecloud',
                method: 'juicefs_remove'
              }
            },
          successUrl:'/startconfiguration/apps/urbackup/access'
          }
        }
      }
    ]
  };
}