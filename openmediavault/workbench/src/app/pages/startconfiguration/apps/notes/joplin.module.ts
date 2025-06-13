
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsJoplinMainComponent } from './joplin-main-page.component';
import {AppsJoplinAccessComponent} from './access/joplin-access-form-page.component'
import {AppsJoplinBackupComponent} from './backup/joplin-backup-page.component'
import {AppsJoplinPasswordResetComponent} from './password/joplin-password-page.component'
import {AppsJoplinRestartComponent} from './restart/joplin-restart-page.component'
import {AppsJoplinUpdateFormPageComponent} from './update/joplin-update-form-page.component'
import {AppsJoplinRestoreComponent} from './restore/joplin-restore-page.component'

/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsJoplinMainComponent,
    AppsJoplinAccessComponent,
    AppsJoplinBackupComponent,
    AppsJoplinPasswordResetComponent,
    AppsJoplinRestartComponent,
    AppsJoplinUpdateFormPageComponent,
    AppsJoplinRestoreComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
  ],
  exports:[
    AppsJoplinMainComponent,
    AppsJoplinAccessComponent,
    AppsJoplinBackupComponent,
    AppsJoplinPasswordResetComponent,
    AppsJoplinRestartComponent,
    AppsJoplinUpdateFormPageComponent,
    AppsJoplinRestoreComponent
  ]
})
export class JoplinModule { }