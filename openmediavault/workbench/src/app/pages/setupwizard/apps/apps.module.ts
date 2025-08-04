
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';


import { DriveModule } from './drive/drive.module';
import { PhotosModule } from './photos/photos.module';
import { PasswordManagerModule } from './password-manager/password-manager.module'
import { PaperlessModule } from './paperless/paperless.module';
import { JoplinModule } from './notes/joplin.module';
import { JellyfinModule } from './media/jellyfin.module';
import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';
import { AppsMainComponent } from './apps-main-page.component';

/*const routes: Routes = [
  { path: 'drive/windows', component: AppsDriveWindowsComponent }
];
*/

@NgModule({
  declarations: [
    AppsMainComponent
    
  ],
  imports: [
    CommonModule,
    SharedModule,
    DriveModule,
    PhotosModule,
    PasswordManagerModule,
    PaperlessModule,
    JoplinModule,
    JellyfinModule,
    PagesModule,
    CoreModule
  //  RouterModule.forChild(routes)
  ],
  exports:[
    DriveModule,
    PhotosModule,
    PasswordManagerModule,
    PaperlessModule,
    JoplinModule,
    JellyfinModule
  ],
})
export class AppsModule { }