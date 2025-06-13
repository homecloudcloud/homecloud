
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsPaperlessMainComponent } from './paperless-main-page.component';
import {AppsPaperlessAccessComponent} from './access/paperless-access-form-page.component';
import {AppsPaperlessPasswordResetComponent} from './password/paperless-password-page.component';
import { AppsPaperlessBackupComponent } from './backup/paperless-backup-page.component';
import {AppsPaperlessRestartComponent} from './restart/paperless-restart-page.component'
import {AppsPaperlessUpdateFormPageComponent} from './update/paperless-update-form-page.component';
import {AppsPaperlessDBResetComponent} from './reset/paperless-db_reset-page.component';
import {AppsPaperlessRestoreComponent} from './restore/paperless-restore-page.component';

/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsPaperlessMainComponent,
    AppsPaperlessAccessComponent,
    AppsPaperlessPasswordResetComponent,
    AppsPaperlessBackupComponent,
    AppsPaperlessRestartComponent,
    AppsPaperlessUpdateFormPageComponent,
    AppsPaperlessDBResetComponent,
    AppsPaperlessRestoreComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
  ],
  exports:[
    AppsPaperlessMainComponent,
    AppsPaperlessAccessComponent,
    AppsPaperlessPasswordResetComponent,
    AppsPaperlessBackupComponent,
    AppsPaperlessRestartComponent,
    AppsPaperlessUpdateFormPageComponent,
    AppsPaperlessDBResetComponent,
    AppsPaperlessRestoreComponent
  ],
})
export class PaperlessModule { }