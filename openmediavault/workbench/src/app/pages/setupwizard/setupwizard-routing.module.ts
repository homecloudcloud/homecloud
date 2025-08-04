import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';

//import { NavigationPageComponent } from '~/app/core/pages/navigation-page/navigation-page.component';
import { RouteConfigService } from '~/app/core/services/route-config.service';
/*import { FirewallRuleFormPageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-form-page.component';
import { FirewallRuleInetDatatablePageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-inet-datatable-page.component';
import { FirewallRuleInet6DatatablePageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-inet6-datatable-page.component';
import { FirewallRuleTabsPageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-tabs-page.component';
import { GeneralNetworkFormPageComponent } from '~/app/pages/network/general/general-network-form-page.component';
*/
//import { InterfaceBondFormPageComponent } from './networkconfig/interfaces/interface-bond-form-page.component';
//import { InterfaceBridgeFormPageComponent } from './networkconfig/interfaces/interface-bridge-form-page.component';
import { InterfaceDatatablePageComponent } from '~/app/pages/setupwizard/networkconfig/interfaces/interface-datatable-page.component';
import { InterfaceDetailsFormPageComponent } from './networkconfig/interfaces/interface-details-form-page.component';
import { InterfaceEthernetFormPageComponent } from '~/app/pages/setupwizard/networkconfig/interfaces/interface-ethernet-form-page.component';
//import { InterfaceVlanFormPageComponent } from '~/app/pages/setupwizard/networkconfig/interfaces/interface-vlan-form-page.component';
import { InterfaceWifiFormPageComponent } from '~/app/pages/setupwizard/networkconfig/interfaces/interface-wifi-form-page.component';
//import { ProxyFormPageComponent } from '~/app/pages/network/proxy/proxy-form-page.component';
import { IsDirtyGuardService } from '~/app/shared/services/is-dirty-guard.service';
import { TailscaleConfigFormPageComponent } from './vpn/tailscaleconfig/tailscale-config-form-page.component';
import { TailscaleStatusComponent } from './vpn/tailscale-status/tailscale-status-form-page.component';
import { TailscaleAccessComponent } from './vpn/tailscale-access/tailscale-access-form-page.component';
import { TailscaleTermsFormPageComponent } from './vpn/tailscale-terms/tailscale-terms-form-page.component';
//import { AppsDriveWindowsComponent } from '~/app/pages/setupwizard/apps/drive/windows/drive-access-form-page.component';
import { AppsDriveMainComponent } from '~/app/pages/setupwizard/apps/drive/drive-form-page.component';
import { AppsDriveAccessComponent } from '~/app/pages/setupwizard/apps/drive/access/drive-access-form-page.component';
//import { AppsDrivemacOSComponent } from '~/app/pages/setupwizard/apps/drive/macos/drive-access-form-page.component';
//import { AppsDriveandroidComponent } from '~/app/pages/setupwizard/apps/drive/android/drive-access-form-page.component';
//import {AppsDriveBackupComponent} from '~/app/pages/setupwizard/apps/drive/backup/drive-backup-page.component';
//import {AppsDriveRestoreComponent} from '~/app/pages/setupwizard/apps/drive/restore/drive-restore-page.component';
import {UserDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-datatable-page.component';
import {UserFormPageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-form-page.component';
//import {UserImportFormPageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-import-form-page.component';
//import {UserSharedFolderPermissionsDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-shared-folder-permissions-datatable-page.component';
//import {SharedFolderDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/shares/shared-folder-datatable-page.component';
//import {SharedFolderFormPageComponent} from '~/app/pages/setupwizard/apps/drive/shares/shared-folder-form-page.component';
//import {SharedFolderPermissionsDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/shares/shared-folder-permissions-datatable-page.component';
import { AppsPhotosMainComponent } from './apps/photos/photos-form-main-page.component';
import { AppsPhotosConfigComponent } from './apps/photos/access/photos-form-page.component';
//import { AppsPhotosRestartComponent } from './apps/photos/restart/photos-restart-page.component';
//import { AppsPhotosDBResetComponent } from './apps/photos/reset/photos-db_reset-page.component';
//import { AppsPhotosBackupComponent } from './apps/photos/backup/photos-backup-page.component';
//import { AppsPhotosPasswordResetComponent } from './apps/photos/password/photos-password-page.component';
//import { AppsPhotosPasswordResetDisplayComponent } from './apps/photos/password/photos-password-display-page.component';
//import { AppsPhotosUpdateFormPageComponent } from './apps/photos/update/photos-update-form-page.component';
//import { AppsPhotosRestoreComponent} from './apps/photos/restore/photos-restore-page.component';
import { AppsPasswordManagerMainComponent } from './apps/password-manager/password-manager-main-page.component';
import {AppsPasswordManagerConfigComponent} from './apps/password-manager/access/password-manager-form-page.component';
//import {AppsPasswordManagerBackupComponent} from './apps/password-manager/backup/password-manager-backup-page.component';
//import {AppsPasswordManagerUpdateFormPageComponent} from './apps/password-manager/update/password-manager-update-form-page.component';
//import {AppsPasswordManagerDBResetComponent} from './apps/password-manager/reset/password-manager-db_reset-page.component';
//import {AppsPasswordManagerRestartComponent} from './apps/password-manager/restart/password-manager-restart-page.component';
//import {AppsPasswordManagerRestoreComponent} from './apps/password-manager/restore/password-manager-restore-page.component';
import {AppsPaperlessMainComponent} from './apps/paperless/paperless-main-page.component';
import {AppsPaperlessAccessComponent } from './apps/paperless/access/paperless-access-form-page.component';
//import {AppsPaperlessPasswordResetComponent} from './apps/paperless/password/paperless-password-page.component';
//import {AppsPaperlessBackupComponent} from './apps/paperless/backup/paperless-backup-page.component';
//import {AppsPaperlessRestartComponent} from './apps/paperless/restart/paperless-restart-page.component';
//import {AppsPaperlessUpdateFormPageComponent} from './apps/paperless/update/paperless-update-form-page.component';
//import {AppsPaperlessDBResetComponent} from './apps/paperless/reset/paperless-db_reset-page.component';
//import {AppsPaperlessRestoreComponent} from './apps/paperless/restore/paperless-restore-page.component';
import {AppsJoplinMainComponent} from './apps/notes/joplin-main-page.component';
import {AppsJoplinAccessComponent} from './apps/notes/access/joplin-access-form-page.component';
//import {AppsJoplinBackupComponent} from './apps/notes/backup/joplin-backup-page.component';
//import {AppsJoplinPasswordResetComponent} from './apps/notes/password/joplin-password-page.component';
//import {AppsJoplinRestartComponent} from './apps/notes/restart/joplin-restart-page.component';
//import {AppsJoplinUpdateFormPageComponent} from './apps/notes/update/joplin-update-form-page.component';
//import {AppsJoplinRestoreComponent} from './apps/notes/restore/joplin-restore-page.component';
import {AppsJellyfinMainComponent} from './apps/media/jellyfin-main-page.component';
import {AppsJellyfinAccessComponent} from './apps/media/access/jellyfin-access-form-page.component';
//import {AppsJellyfinBackupComponent} from './apps/media/backup/jellyfin-backup-page.component';
//import {AppsJellyfinRestartComponent } from './apps/media/restart/jellyfin-restart-page.component';
//import {AppsJellyfinUpdateFormPageComponent} from './apps/media/update/jellyfin-update-form-page.component';
import {DateTimeFormPageComponent} from './date-time/date-time-form-page.component';
import {NotificationSettingsFormPageComponent} from './notification/notification-settings-form-page.component';
import {SetupWizardComponent} from './setupwizard';
import { CompletePageComponent } from './complete/complete';
import { NetworkMainComponent } from './networkconfig/network-main-page.component';
import { VPNMainComponent } from './vpn/vpn-main-page.component';
import { AppsMainComponent } from './apps/apps-main-page.component';

const routes: Routes = [
  {
    path: '',
    component: SetupWizardComponent
    
  },
  {
      path: 'datetime',
      data: { title: gettext('Date Time Settings'), editing: true,
        notificationTitle: gettext('Updated date & time settings.')
      },
      component: DateTimeFormPageComponent
      
  },
  {
      path: 'notificationsettings',
      data: { title: gettext('Notification Settings'), editing: true,
        notificationTitle: gettext('Updated notification settings.')
       },
      component: NotificationSettingsFormPageComponent
      
  },
  {
    path:'networkconfig',
    data: { title: gettext('Network') },
    children:[
      {
        path: '',
        component: NetworkMainComponent
      },
      {
        path: 'interfaces',
        data: { title: gettext('Interfaces') },
        children: [
          { path: '', component: InterfaceDatatablePageComponent },
          {
            path: 'details/:devicename',
            component: InterfaceDetailsFormPageComponent,
            data: { title: gettext('Details'), editing: true }
          },
          {
            path: 'ethernet/edit/:uuid',
            component: InterfaceEthernetFormPageComponent,
            canDeactivate: [IsDirtyGuardService],
            data: {
              title: gettext('Edit'),
              editing: true,
              notificationTitle: gettext('Updated wired network connection "{{ devicename }}".')
            }
          },
          {
            path: 'wifi/create',
            component: InterfaceWifiFormPageComponent,
            canDeactivate: [IsDirtyGuardService],
            data: {
              title: gettext('Create'),
              editing: false,
              notificationTitle: gettext('Created wireless network connection.')
            }
          },
          {
            path: 'wifi/edit/:uuid',
            component: InterfaceWifiFormPageComponent,
           // canDeactivate: [IsDirtyGuardService],
            data: {
              title: gettext('Edit'),
              editing: true,
              notificationTitle: gettext('Updated wireless network connection "{{ devicename }}".')
            }
          }
  
        ]
      }

    ]
  },
 
  {
    path: 'vpn',
    data: { title: gettext('VPN') },
    children: [
      {
        path: '',
        component: VPNMainComponent
      },
      {
        path: 'tailscaleconfig',
        component: TailscaleConfigFormPageComponent,
        //canDeactivate: [IsDirtyGuardService],
        data: {
          title: gettext('Configure'),
          editing: true
        }
      },
      {
        path: 'status',
        component: TailscaleStatusComponent,
        data: {
          title: gettext('Status'),
          editing: true
        }
      },
      {
        path: 'access',
        component: TailscaleAccessComponent,
        data: { 
          title: gettext('Access Homecloud'),
          editing: true
        }
      }
      ,
      {
        path: 'terms',
        component: TailscaleTermsFormPageComponent,
        data: { 
          title: gettext('Tailscale terms'),
          editing: true
        }
      }
    ]
  },
  {
      path: 'apps',
      data: { title: gettext('Apps') },
      children: [
        {
          path: '',
      //    component: NavigationPageComponent
          component: AppsMainComponent
        },
        {
          path: 'drive',
          data: { title: gettext('Drive') },
    //    component: AppsDriveMainComponent,
          children: [
            {
              path: '',
              component: AppsDriveMainComponent,
            },
            
            {
              path: 'access',
              component: AppsDriveAccessComponent,
              //canDeactivate: [IsDirtyGuardService],
              data: {
                title: gettext('Access'),
                editing: true
              }
            },
            
            {
              path: 'users',
              data: { title: gettext('Users') },
              children: [
                { path: '', component: UserDatatablePageComponent },
                {
                  path: 'create',
                  component: UserFormPageComponent,
                  canDeactivate: [IsDirtyGuardService],
                  data: {
                    title: gettext('Create'),
                    editing: false,
                    notificationTitle: gettext('Created user "{{ name }}".')
                  }
                },
                {
                  path: 'edit/:name',
                  component: UserFormPageComponent,
                  canDeactivate: [IsDirtyGuardService],
                  data: {
                    title: gettext('Edit'),
                    editing: true,
                    notificationTitle: gettext('Updated user "{{ name }}".')
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'photos',
          data: { title: gettext('Photos') },
    //    component: ,
          children: [
            {
              path: '',
              component: AppsPhotosMainComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'access',
              component: AppsPhotosConfigComponent,
              data: {
                title: gettext('Access'),
                editing: true
              }
            }
            /*
            ,
          
            {
              path: 'restart',
              component: AppsPhotosRestartComponent,
              data: {
                title: gettext('Restart'),
                editing: true
              }
            },
            {
              path: 'reset',
              component: AppsPhotosDBResetComponent,
              data: {
                title: gettext('Reset'),
                editing: true
              }
            },
            {
              path: 'backup',
              component: AppsPhotosBackupComponent,
              data: {
                title: gettext('Backup'),
                editing: true
              }
            },
            {
              path: 'password',
              //component: AppsPhotosPasswordResetComponent,
              children: [
                {
                  path: '',
                  component: AppsPhotosPasswordResetComponent,
                  data: {
                    title: gettext('Password'),
                    editing: true
                  },
                },
                {
                  path: 'display',
                  component: AppsPhotosPasswordResetDisplayComponent,
                  data: {
                    title: gettext('Display'),
                    editing: true
                  },
                }
              ]
            },
            {
              path: 'update',
              component: AppsPhotosUpdateFormPageComponent,
              data:{
                title: gettext('Update'),
                editing: true
  
              }
            },
            {
              path: 'restore',
              component: AppsPhotosRestoreComponent,
              data:{
                title: gettext('Restore'),
                editing: true
              }
            }
            */
          ]
        },
        {
          path: 'password-manager',
          data: { title: gettext('Password Manager') },
    //    component: ,
          children: [
            {
              path: '',
              component: AppsPasswordManagerMainComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'access',
              component: AppsPasswordManagerConfigComponent,
              data: {
                title: gettext('Access'),
                editing: true
              }
            }
            /*
            ,
            
            {
              path: 'backup',
              component: AppsPasswordManagerBackupComponent,
              data: {
                title: gettext('Backup'),
                editing: true
              }
            },
            {
              path: 'update',
              component: AppsPasswordManagerUpdateFormPageComponent,
              data: {
                title: gettext('Update'),
                editing: true
              }
            },
            {
              path: 'reset',
              component: AppsPasswordManagerDBResetComponent,
              data: {
                title: gettext('Reset'),
                editing: true
              }
            },
            {
              path: 'restart',
              component: AppsPasswordManagerRestartComponent,
              data: {
                title: gettext('Restart'),
                editing: true
              }
            },
            {
              path: 'restore',
              component: AppsPasswordManagerRestoreComponent,
              data: {
                title: gettext('Restore'),
                editing: true
              }
            }
            */
          ]
        },
        {
          path: 'paperless',
          data: { title: gettext('Document Manager') },
    //    component: ,
          children: [
            {
              path: '',
              component: AppsPaperlessMainComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'access',
              component: AppsPaperlessAccessComponent,
              data: {
                editing: true
              }
            }
            /*
            ,
            
            {
              path: 'password',
              component: AppsPaperlessPasswordResetComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'backup',
              component: AppsPaperlessBackupComponent,
              data: {
                title: gettext('Backup'),
                editing: true
              }
            },
            {
              path: 'restart',
              component: AppsPaperlessRestartComponent,
              data: {
                title: gettext('Status'),
                editing: true
              }
            },
            {
              path: 'update',
              component: AppsPaperlessUpdateFormPageComponent,
              data: {
                title: gettext('Update'),
                editing: true
              }
            },
            {
              path: 'reset',
              component: AppsPaperlessDBResetComponent,
              data: {
                title: gettext('Reset'),
                editing: true
              }
            },
            {
              path: 'restore',
              component: AppsPaperlessRestoreComponent,
              data: {
                title: gettext('Restore'),
                editing: true
              }
            }
              */
          ]
        },
        {
          path: 'notes',
          data: { title: gettext('Notes') },
    //    component: ,
          children: [
            {
              path: '',
              component: AppsJoplinMainComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'access',
              component: AppsJoplinAccessComponent,
              data: {
                editing: true
              }
            }
            /*
            ,

            {
              path: 'backup',
              component: AppsJoplinBackupComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'password',
              component: AppsJoplinPasswordResetComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'restart',
              component: AppsJoplinRestartComponent,
              data: {
                title: gettext('Status'),
                editing: true
              }
            },
            {
              path: 'update',
              component: AppsJoplinUpdateFormPageComponent,
              data: {
                title: gettext('Update'),
                editing: true
              }
            },
            {
              path: 'restore',
              component: AppsJoplinRestoreComponent,
              data: {
                title: gettext('Restore'),
                editing: true
              }
            }
              */
          ]
        },
        {
          path: 'media',
          data: { title: gettext('Media') },
    //    component: ,
          children: [
            {
              path: '',
              component: AppsJellyfinMainComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'access',
              component: AppsJellyfinAccessComponent,
              data: {
                editing: true
              }
            }
            /*
            ,
            {
              path: 'backup',
              component: AppsJellyfinBackupComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'restart',
              component: AppsJellyfinRestartComponent,
              data: {
                editing: true
              }
            },
            {
              path: 'update',
              component: AppsJellyfinUpdateFormPageComponent,
              data: {
                editing: true
              }
            }
            */
          ]
        }
      ]
    },
    {
      path: 'complete',
      component: CompletePageComponent,
      data: { title: gettext('Complete') }
    }
  ];
 
@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [
    {
      provide: ROUTES,
      multi: true,
      useFactory: (routeConfigService: RouteConfigService): Routes => {
        routeConfigService.inject('setupwizard', routes);
        return routes;
      },
      deps: [RouteConfigService]
    }
  ]
})
export class SetupWizardRoutingModule {}
