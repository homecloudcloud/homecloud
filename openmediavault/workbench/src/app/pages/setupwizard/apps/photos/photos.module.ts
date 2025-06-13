
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { AppsPhotosMainComponent } from './photos-form-main-page.component';
import {AppsPhotosConfigComponent} from '~/app/pages/setupwizard/apps/photos/access/photos-form-page.component';
import { AppsPhotosRestartComponent } from './restart/photos-restart-page.component';
import { AppsPhotosDBResetComponent } from './reset/photos-db_reset-page.component';
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsPhotosBackupComponent } from './backup/photos-backup-page.component';
import { AppsPhotosPasswordResetComponent } from './password/photos-password-page.component';
import {AppsPhotosPasswordResetDisplayComponent} from './password/photos-password-display-page.component'
import {AppsPhotosUpdateFormPageComponent} from './update/photos-update-form-page.component'
import {AppsPhotosRestoreComponent} from './restore/photos-restore-page.component'

/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsPhotosMainComponent,
    AppsPhotosConfigComponent,
    AppsPhotosRestartComponent,
    AppsPhotosDBResetComponent,
    AppsPhotosBackupComponent,
    AppsPhotosPasswordResetComponent,
    AppsPhotosPasswordResetDisplayComponent,
    AppsPhotosUpdateFormPageComponent,
    AppsPhotosRestoreComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
    //RouterModule.forChild(routes)
  ],
  exports:[
    AppsPhotosMainComponent,
    AppsPhotosConfigComponent,
    AppsPhotosRestartComponent,
    AppsPhotosDBResetComponent,
    AppsPhotosBackupComponent,
    AppsPhotosPasswordResetComponent,
    AppsPhotosPasswordResetDisplayComponent,
    AppsPhotosUpdateFormPageComponent,
    AppsPhotosRestoreComponent
  ],
})
export class PhotosModule { }