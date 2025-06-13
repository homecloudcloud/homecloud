import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

import { CoreModule } from '~/app/core/core.module';
import { MaterialModule } from '~/app/material.module';

import { NetworkRoutingModule } from '~/app/pages/network/network-routing.module';
import { NetworkModule } from '~/app/pages/network/network.module';

import { SharedModule } from '~/app/shared/shared.module';


@NgModule({
  declarations: [
    /*GeneralNetworkFormPageComponent,
    ProxyFormPageComponent,
    InterfaceDatatablePageComponent,
    InterfaceEthernetFormPageComponent,
    InterfaceWifiFormPageComponent,
    InterfaceBondFormPageComponent,
    InterfaceVlanFormPageComponent,
    FirewallRuleFormPageComponent,
    FirewallRuleTabsPageComponent,
    FirewallRuleInetDatatablePageComponent,
    FirewallRuleInet6DatatablePageComponent,
    InterfaceBridgeFormPageComponent,
    InterfaceDetailsFormPageComponent
    */
  ],
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    SharedModule,
    NetworkRoutingModule,
    NetworkModule,
    TranslocoModule
  ]
})
export class AdvancedSettingsModule {}
