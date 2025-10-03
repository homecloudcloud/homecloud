
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { AppsCloudbackupMainComponent } from './cloudbackup-form-main-page.component';
import { AppsCloudbackupAccessComponent} from '~/app/pages/startconfiguration/apps/cloudbackup/access/cloudbackup-access-form-page.component';
import { AppsCloudbackupRestartComponent } from './restart/cloudbackup-restart-page.component'
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsCloudbackupPasswordResetComponent } from './password/cloudbackup-password-page.component';
import {AppsCloudbackupPasswordResetDisplayComponent} from './password/cloudbackup-password-display-page.component';
import {AppsCloudbackupUpdateFormPageComponent} from './update/cloudbackup-update-form-page.component';



/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsCloudbackupMainComponent,
    AppsCloudbackupAccessComponent,
    AppsCloudbackupRestartComponent,
    AppsCloudbackupPasswordResetComponent,
    AppsCloudbackupPasswordResetDisplayComponent,
    AppsCloudbackupUpdateFormPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
    //RouterModule.forChild(routes)
  ],
  exports:[
    AppsCloudbackupMainComponent,
    AppsCloudbackupAccessComponent,
    AppsCloudbackupRestartComponent,
    AppsCloudbackupPasswordResetComponent,
    AppsCloudbackupPasswordResetDisplayComponent,
    AppsCloudbackupUpdateFormPageComponent
    
  ],
})
export class CloudbackupModule { }