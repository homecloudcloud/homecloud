
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';

import { TailscaleStatusComponent } from '~/app/pages/startconfiguration/vpn/tailscale-status/tailscale-status-form-page.component';
import { TailscaleConfigFormPageComponent} from '~/app/pages/startconfiguration/vpn/tailscaleconfig/tailscale-config-form-page.component';
import { TailscaleAccessComponent } from '~/app/pages/startconfiguration/vpn/tailscale-access/tailscale-access-form-page.component';
import {TailscaleUpdateFormPageComponent} from '~/app/pages/startconfiguration/vpn/tailscale-update/tailscale-update-form-page.component';

const routes: Routes = [
  { path: 'status', component: TailscaleStatusComponent },
  { path: 'tailscaleconfig', component: TailscaleConfigFormPageComponent },
  { path: 'access', component: TailscaleAccessComponent }
  { path: 'update', component: TailscaleUpdateFormPageComponent }
];

@NgModule({
  declarations: [
    TailscaleStatusComponent,
    TailscaleConfigFormPageComponent,
    TailscaleAccessComponent,
    TailscaleUpdateFormPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports:[
    TailscaleStatusComponent,
    TailscaleConfigFormPageComponent,
    TailscaleAccessComponent,
    TailscaleUpdateFormPageComponent
  ],
})
export class VpnModule { }