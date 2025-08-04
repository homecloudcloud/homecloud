import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

import { CoreModule } from '~/app/core/core.module';
import { MaterialModule } from '~/app/material.module';
import { SharedModule } from '~/app/shared/shared.module';
import { FirewallRuleFormPageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-form-page.component';
import { SshFormPageComponent } from '~/app/pages/advancedsettings/ssh/ssh-form-page.component';
import { FirewallRuleInetDatatablePageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-inet-datatable-page.component';
import { FirewallRuleInet6DatatablePageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-inet6-datatable-page.component';
import { FirewallRuleTabsPageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-tabs-page.component';
import { AdvancedSettingsRoutingModule } from './advancedsettings-routing.module';
import { AdvancedsettingsMainPageComponent } from './advancedsettings-main-page.component';


@NgModule({
  declarations: [
    FirewallRuleFormPageComponent,
    FirewallRuleTabsPageComponent,
    FirewallRuleInetDatatablePageComponent,
    FirewallRuleInet6DatatablePageComponent,
    SshFormPageComponent,
    AdvancedsettingsMainPageComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    SharedModule,
    AdvancedSettingsRoutingModule,
    TranslocoModule
  ]
})
export class AdvancedSettingsModule {}

