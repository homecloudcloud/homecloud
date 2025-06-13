import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

import { CoreModule } from '~/app/core/core.module';
import { MaterialModule } from '~/app/material.module';
/*import { FirewallRuleFormPageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-form-page.component';
import { FirewallRuleInetDatatablePageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-inet-datatable-page.component';
import { FirewallRuleInet6DatatablePageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-inet6-datatable-page.component';
import { FirewallRuleTabsPageComponent } from '~/app/pages/network/firewall/rules/firewall-rule-tabs-page.component';
import { GeneralNetworkFormPageComponent } from '~/app/pages/network/general/general-network-form-page.component';
*/
import { InterfaceBondFormPageComponent } from '~/app/pages/startconfiguration/networkconfig/interfaces/interface-bond-form-page.component';
import { InterfaceBridgeFormPageComponent } from '~/app/pages/startconfiguration/networkconfig/interfaces/interface-bridge-form-page.component';
import { InterfaceDatatablePageComponent } from '~/app/pages/startconfiguration/networkconfig/interfaces/interface-datatable-page.component';
import { InterfaceDetailsFormPageComponent } from './networkconfig/interfaces/interface-details-form-page.component';
import { InterfaceEthernetFormPageComponent } from '~/app/pages/startconfiguration/networkconfig/interfaces/interface-ethernet-form-page.component';
import { InterfaceVlanFormPageComponent } from '~/app/pages/startconfiguration/networkconfig/interfaces/interface-vlan-form-page.component';
import { InterfaceWifiFormPageComponent } from '~/app/pages/startconfiguration/networkconfig/interfaces/interface-wifi-form-page.component';
import { NetworkMainComponent } from '~/app/pages/startconfiguration/networkconfig/network-main-page.component';
import { TailscaleConfigFormPageComponent} from '~/app/pages/startconfiguration/vpn/tailscaleconfig/tailscale-config-form-page.component';
import { TailscaleStatusComponent } from '~/app/pages/startconfiguration/vpn/tailscale-status/tailscale-status-form-page.component';
import { TailscaleAccessComponent } from '~/app/pages/startconfiguration/vpn/tailscale-access/tailscale-access-form-page.component';
import { TailscaleUpdateFormPageComponent } from '~/app/pages/startconfiguration/vpn/tailscale-update/tailscale-update-form-page.component';

/*import { NetworkRoutingModule } from '~/app/pages/network/network-routing.module';
import { ProxyFormPageComponent } from '~/app/pages/network/proxy/proxy-form-page.component';
*/
import { SharedModule } from '~/app/shared/shared.module';
import { StartConfigurationRoutingModule } from './startconfiguration-routing.module';
import { UserPasswordFormPageComponent } from './userconfig/user-password-form-page.component';
import { UserFormPageComponent } from './userconfig/user-form-page.component';
import { UserDatatablePageComponent } from './userconfig/user-datatable-page.component';
import { PagesModule } from '~/app/core/pages/pages.module';
import { AppsModule } from './apps/apps.module';
import { NotificationSettingsFormPageComponent } from './notification/notification-settings-form-page.component';
import { DateTimeFormPageComponent } from './date-time/date-time-form-page.component';
import {USBModule} from './usb-disks/usb-disks.module';

@NgModule({
  declarations: [
   // GeneralNetworkFormPageComponent,
   // ProxyFormPageComponent,
    InterfaceDatatablePageComponent,
    InterfaceEthernetFormPageComponent,
    InterfaceWifiFormPageComponent,
    InterfaceBondFormPageComponent,
    InterfaceVlanFormPageComponent,
   /* FirewallRuleFormPageComponent,
    FirewallRuleTabsPageComponent,
    FirewallRuleInetDatatablePageComponent,
    FirewallRuleInet6DatatablePageComponent,
    */
    InterfaceBridgeFormPageComponent,
    InterfaceDetailsFormPageComponent,
    TailscaleConfigFormPageComponent,
    UserPasswordFormPageComponent,
    UserFormPageComponent,
    UserDatatablePageComponent,
    TailscaleStatusComponent,
    TailscaleAccessComponent,
    TailscaleUpdateFormPageComponent,
    NotificationSettingsFormPageComponent,
    DateTimeFormPageComponent,
    NetworkMainComponent
  ],
  /**Home cloud changes start */
  exports:[
    TailscaleConfigFormPageComponent,
    InterfaceWifiFormPageComponent,
    UserPasswordFormPageComponent,
    UserFormPageComponent,
    UserDatatablePageComponent,
    TailscaleStatusComponent,
    TailscaleAccessComponent,
    TailscaleUpdateFormPageComponent,
    NotificationSettingsFormPageComponent,
    DateTimeFormPageComponent,
    NetworkMainComponent
  ],
    /**Home cloud changes end */
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    SharedModule,
    //NetworkRoutingModule,
    StartConfigurationRoutingModule,
    TranslocoModule,
    PagesModule,
    AppsModule,
    USBModule

  ]
})
export class StartConfigurationModule {}
