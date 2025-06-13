
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';

import { TailscaleStatusComponent } from '~/app/pages/setupwizard/vpn/tailscale-status/tailscale-status-form-page.component';
import { TailscaleConfigFormPageComponent} from '~/app/pages/setupwizard/vpn/tailscaleconfig/tailscale-config-form-page.component';
import { TailscaleAccessComponent } from '~/app/pages/setupwizard/vpn/tailscale-access/tailscale-access-form-page.component';

const routes: Routes = [
  { path: 'status', component: TailscaleStatusComponent },
  { path: 'tailscaleconfig', component: TailscaleConfigFormPageComponent },
  { path: 'access', component: TailscaleAccessComponent }
];

@NgModule({
  declarations: [
    TailscaleStatusComponent,
    TailscaleConfigFormPageComponent,
    TailscaleAccessComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports:[
    TailscaleStatusComponent,
    TailscaleConfigFormPageComponent,
    TailscaleAccessComponent
  ],
})
export class VpnModule { }