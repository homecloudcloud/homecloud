
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import {AppsDriveMainComponent} from '~/app/pages/setupwizard/apps/drive/drive-form-page.component'
//import {AppsDriveWindowsComponent} from '~/app/pages/setupwizard/apps/drive/windows/drive-access-form-page.component';
import {AppsDriveAccessComponent} from '~/app/pages/setupwizard/apps/drive/access/drive-access-form-page.component';
//import {AppsDrivemacOSComponent} from '~/app/pages/setupwizard/apps/drive/macos/drive-access-form-page.component';
//import {AppsDriveandroidComponent} from '~/app/pages/setupwizard/apps/drive/android/drive-access-form-page.component';
//import {AppsDriveBackupComponent} from '~/app/pages/setupwizard/apps/drive/backup/drive-backup-page.component';
//import {AppsDriveRestoreComponent} from '~/app/pages/setupwizard/apps/drive/restore/drive-restore-page.component';
import {UserDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-datatable-page.component';
import {UserFormPageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-form-page.component';
import {UserImportFormPageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-import-form-page.component';
import {UserSharedFolderPermissionsDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/users/user-shared-folder-permissions-datatable-page.component';
import {SharedFolderDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/shares/shared-folder-datatable-page.component';
import {SharedFolderFormPageComponent} from '~/app/pages/setupwizard/apps/drive/shares/shared-folder-form-page.component';
import {SharedFolderPermissionsDatatablePageComponent} from '~/app/pages/setupwizard/apps/drive/shares/shared-folder-permissions-datatable-page.component';


import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';

/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
  //  AppsDriveWindowsComponent,
    AppsDriveAccessComponent,
  //  AppsDrivemacOSComponent,
  //  AppsDriveandroidComponent,
    AppsDriveMainComponent,
  //  AppsDriveBackupComponent,
  //  AppsDriveRestoreComponent,
    UserDatatablePageComponent,
    UserFormPageComponent,
    UserImportFormPageComponent,
    UserSharedFolderPermissionsDatatablePageComponent,
    SharedFolderDatatablePageComponent,
    SharedFolderFormPageComponent,
    SharedFolderPermissionsDatatablePageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
    //RouterModule.forChild(routes)
  ],
  exports:[
  //  AppsDriveWindowsComponent,
    AppsDriveAccessComponent,
  //  AppsDrivemacOSComponent,
  //  AppsDriveandroidComponent,
    AppsDriveMainComponent,
  //  AppsDriveBackupComponent,
  //  AppsDriveRestoreComponent,
    UserDatatablePageComponent,
    UserFormPageComponent,
    UserImportFormPageComponent,
    UserSharedFolderPermissionsDatatablePageComponent,
    SharedFolderDatatablePageComponent,
    SharedFolderFormPageComponent,
    SharedFolderPermissionsDatatablePageComponent
  ],
})
export class DriveModule { }