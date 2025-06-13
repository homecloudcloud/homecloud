import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

import { CoreModule } from '~/app/core/core.module';
import { MaterialModule } from '~/app/material.module';

import { SharedModule } from '~/app/shared/shared.module';
import { AboutHomecloudPageComponent } from './about-homecloud-page.component';
import { LicensesPageComponent } from './licenses/licenses-page.component';
import { CodePageComponent } from './code/code-page.component';
import { AboutRoutingModule } from './about-routing.module';

@NgModule({
  declarations: [
    AboutHomecloudPageComponent,
    LicensesPageComponent,
    CodePageComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    SharedModule,
    AboutRoutingModule,
    TranslocoModule
  ]
})
export class AboutModule {}
