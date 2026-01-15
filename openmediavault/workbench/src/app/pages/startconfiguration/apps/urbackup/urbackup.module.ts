
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { AppsUrbackupMainComponent } from './urbackup-form-main-page.component';
import { AppsUrbackupAccessComponent} from '~/app/pages/startconfiguration/apps/urbackup/access/urbackup-access-form-page.component';
import { AppsUrbackupRestartComponent } from './restart/urbackup-restart-page.component'
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsUrbackupPasswordResetComponent } from './password/urbackup-password-page.component';
import {AppsUrbackupPasswordResetDisplayComponent} from './password/urbackup-password-display-page.component';
import {AppsUrbackupUpdateFormPageComponent} from './update/urbackup-update-form-page.component';



/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsUrbackupMainComponent,
    AppsUrbackupAccessComponent,
    AppsUrbackupRestartComponent,
    AppsUrbackupPasswordResetComponent,
    AppsUrbackupPasswordResetDisplayComponent,
    AppsUrbackupUpdateFormPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
    //RouterModule.forChild(routes)
  ],
  exports:[
    AppsUrbackupMainComponent,
    AppsUrbackupAccessComponent,
    AppsUrbackupRestartComponent,
    AppsUrbackupPasswordResetComponent,
    AppsUrbackupPasswordResetDisplayComponent,
    AppsUrbackupUpdateFormPageComponent
  ],
})
export class UrbackupModule { }