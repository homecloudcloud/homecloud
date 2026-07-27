
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsLinshareMainComponent } from './linshare-main-page.component';
import {AppsLinshareAccessComponent} from './access/linshare-access-form-page.component'
import {AppsLinshareRestartComponent} from './restart/linshare-restart-page.component'
import { AppsLinshareResetComponent } from './reset/linshare_reset-page.component';

/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsLinshareMainComponent,
    AppsLinshareAccessComponent,
    AppsLinshareRestartComponent,
    AppsLinshareResetComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
  ],
  exports:[
    AppsLinshareMainComponent,
    AppsLinshareAccessComponent,
    AppsLinshareRestartComponent,
    AppsLinshareResetComponent
  ]
})
export class LinshareModule { }