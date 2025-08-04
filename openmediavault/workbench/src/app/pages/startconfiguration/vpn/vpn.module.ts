
// src/app/pages/vpn/vpn.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '~/app/shared/shared.module';

import { TailscaleStatusComponent } from '~/app/pages/startconfiguration/vpn/tailscale-status/tailscale-status-form-page.component';
import { TailscaleConfigFormPageComponent} from '~/app/pages/startconfiguration/vpn/tailscaleconfig/tailscale-config-form-page.component';
import { TailscaleAccessComponent } from '~/app/pages/startconfiguration/vpn/tailscale-access/tailscale-access-form-page.component';
import {TailscaleUpdateFormPageComponent} from '~/app/pages/startconfiguration/vpn/tailscale-update/tailscale-update-form-page.component';
import { PagesModule } from "~/app/core/pages/pages.module";
import { CoreModule } from '~/app/core/core.module';
import { VPNMainComponent } from './vpn-main-page.component';
import { TailscaleTermsFormPageComponent } from './tailscale-terms/tailscale-terms-form-page.component';
import { VPNSecurebrowseComponent } from './tailscale-secure-browsing/tailscale-securebrowse-form-page.component';


const routes: Routes = [
  { path: 'status', component: TailscaleStatusComponent },
  { path: 'tailscaleconfig', component: TailscaleConfigFormPageComponent },
  { path: 'access', component: TailscaleAccessComponent },
  { path: 'update', component: TailscaleUpdateFormPageComponent }
];

@NgModule({
  declarations: [
    VPNMainComponent,
    TailscaleStatusComponent,
    TailscaleConfigFormPageComponent,
    TailscaleAccessComponent,
    TailscaleUpdateFormPageComponent,
    TailscaleTermsFormPageComponent,
    VPNSecurebrowseComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    PagesModule,
    CoreModule
],
  exports:[
    VPNMainComponent,
    TailscaleStatusComponent,
    TailscaleConfigFormPageComponent,
    TailscaleAccessComponent,
    TailscaleUpdateFormPageComponent
  ],
})
export class VpnModule { }