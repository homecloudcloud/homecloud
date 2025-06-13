
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';
import {DiskDatatablePageComponent} from '~/app/pages/startconfiguration/usb-disks/disk-datatable-page.component';
import {DiskFormPageComponent} from '~/app/pages/startconfiguration/usb-disks/disk-form-page.component';
import { FilesystemDatatablePageComponent } from '~/app/pages/startconfiguration/usb-disks/filesystems/filesystem-datatable-page.component';
import { FilesystemDetailsTextPageComponent } from '~/app/pages/startconfiguration/usb-disks/filesystems/filesystem-details-text-page.component';
import { FilesystemEditFormPageComponent } from '~/app/pages/startconfiguration/usb-disks/filesystems/filesystem-edit-form-page.component';
import { FilesystemMountFormPageComponent } from '~/app/pages/startconfiguration/usb-disks/filesystems/filesystem-mount-form-page.component';
import { FilesystemQuotaDatatablePageComponent } from '~/app/pages/startconfiguration/usb-disks/filesystems/filesystem-quota-datatable-page.component';
import { FilesystemQuotaFormPageComponent } from '~/app/pages/startconfiguration/usb-disks/filesystems/filesystem-quota-form-page.component';

import { PagesModule } from '~/app/core/pages/pages.module';
import { CoreModule } from '~/app/core/core.module';

/*const routes: Routes = [
  { path: 'windows', component: AppsDriveWindowsComponent }
];
*/



@NgModule({
  declarations: [
    DiskDatatablePageComponent,
    DiskFormPageComponent,
    FilesystemDatatablePageComponent,
    FilesystemDetailsTextPageComponent,
    FilesystemEditFormPageComponent,
    FilesystemMountFormPageComponent,
    FilesystemQuotaDatatablePageComponent,
    FilesystemQuotaFormPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesModule,
    CoreModule
    //RouterModule.forChild(routes)
  ],
  exports:[
    DiskDatatablePageComponent,
    DiskFormPageComponent,
    FilesystemDatatablePageComponent,
    FilesystemDetailsTextPageComponent,
    FilesystemEditFormPageComponent,
    FilesystemMountFormPageComponent,
    FilesystemQuotaDatatablePageComponent,
    FilesystemQuotaFormPageComponent
  ],
})
export class USBModule { }