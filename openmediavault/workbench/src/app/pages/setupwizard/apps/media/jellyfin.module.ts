
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsJellyfinMainComponent } from './jellyfin-main-page.component';
import {AppsJellyfinAccessComponent} from './access/jellyfin-access-form-page.component';
import {AppsJellyfinBackupComponent} from './backup/jellyfin-backup-page.component';
import {AppsJellyfinRestartComponent} from './restart/jellyfin-restart-page.component';
import {AppsJellyfinUpdateFormPageComponent} from './update/jellyfin-update-form-page.component';


/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsJellyfinMainComponent,
    AppsJellyfinAccessComponent,
    AppsJellyfinBackupComponent,
    AppsJellyfinRestartComponent,
    AppsJellyfinUpdateFormPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
  ],
  exports:[
    AppsJellyfinMainComponent,
    AppsJellyfinAccessComponent,
    AppsJellyfinBackupComponent,
    AppsJellyfinRestartComponent,
    AppsJellyfinUpdateFormPageComponent
  ]
})
export class JellyfinModule { }