
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsPasswordManagerMainComponent } from './password-manager-main-page.component';
import {AppsPasswordManagerConfigComponent} from './access/password-manager-form-page.component'
import {AppsPasswordManagerBackupComponent} from './backup/password-manager-backup-page.component'
import {AppsPasswordManagerUpdateFormPageComponent} from './update/password-manager-update-form-page.component'
import {AppsPasswordManagerDBResetComponent} from './reset/password-manager-db_reset-page.component'
import {AppsPasswordManagerRestartComponent} from './restart/password-manager-restart-page.component'
import {AppsPasswordManagerRestoreComponent} from './restore/password-manager-restore-page.component'
import {AppsPasswordManagerPasswordResetComponent} from './password/password-manager-password-page.component'

/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsPasswordManagerMainComponent,
    AppsPasswordManagerConfigComponent,
    AppsPasswordManagerBackupComponent,
    AppsPasswordManagerUpdateFormPageComponent,
    AppsPasswordManagerDBResetComponent,
    AppsPasswordManagerRestartComponent,
    AppsPasswordManagerRestoreComponent,
    AppsPasswordManagerPasswordResetComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
  ],
  exports:[
    AppsPasswordManagerMainComponent,
    AppsPasswordManagerConfigComponent,
    AppsPasswordManagerBackupComponent,
    AppsPasswordManagerUpdateFormPageComponent,
    AppsPasswordManagerDBResetComponent,
    AppsPasswordManagerRestartComponent,
    AppsPasswordManagerRestoreComponent
  ],
})
export class PasswordManagerModule { }