import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';

import { NavigationPageComponent } from '~/app/core/pages/navigation-page/navigation-page.component';
import { RouteConfigService } from '~/app/core/services/route-config.service';
import { FirewallRuleFormPageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-form-page.component';
import { FirewallRuleInetDatatablePageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-inet-datatable-page.component';
import { FirewallRuleInet6DatatablePageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-inet6-datatable-page.component';
import { FirewallRuleTabsPageComponent } from '~/app/pages/advancedsettings/firewall/rules/firewall-rule-tabs-page.component';
import { SshFormPageComponent } from '~/app/pages/advancedsettings/ssh/ssh-form-page.component';
import { ResetComponent } from '~/app/pages/advancedsettings/reset/reset-page.component';
import { IsDirtyGuardService } from '~/app/shared/services/is-dirty-guard.service';
import { AdvancedsettingsMainPageComponent } from './advancedsettings-main-page.component';


const routes: Routes = [
  {
    path: '',
    //component: NavigationPageComponent
    component: AdvancedsettingsMainPageComponent
  },
  {
    path: 'firewall',
    data: { title: gettext('Firewall') },
    children: [
      { path: '', component: NavigationPageComponent },
      {
        path: 'rules',
        data: { title: gettext('Rules') },
        children: [
          {
            path: '',
            component: FirewallRuleTabsPageComponent,
            children: [
              {
                path: '',
                redirectTo: 'inet',
                pathMatch: 'full'
              },
              {
                path: 'inet',
                component: FirewallRuleInetDatatablePageComponent,
                canDeactivate: [IsDirtyGuardService]
              },
              {
                path: 'inet6',
                component: FirewallRuleInet6DatatablePageComponent,
                canDeactivate: [IsDirtyGuardService]
              }
            ]
          },
          {
            path: ':family/create',
            component: FirewallRuleFormPageComponent,
            canDeactivate: [IsDirtyGuardService],
            data: {
              title: gettext('Create'),
              editing: false,
              notificationTitle: gettext('Created firewall rule.')
            }
          },
          {
            path: ':family/edit/:uuid',
            component: FirewallRuleFormPageComponent,
            canDeactivate: [IsDirtyGuardService],
            data: {
              title: gettext('Edit'),
              editing: true,
              notificationTitle: gettext('Updated firewall rule.')
            }
          }
        ]
      }
    ]
  },
  {
    path: 'ssh',
    component: SshFormPageComponent,
    canDeactivate: [IsDirtyGuardService],
    data: {
      title: gettext('SSH'),
      editing: true,
      notificationTitle: gettext('Updated SSH settings.')
    }
  },
  {
    path: 'reset',
    component: ResetComponent,
    canDeactivate: [IsDirtyGuardService],
    data: {
      title: gettext('Reset'),
      editing: true,
      notificationTitle: gettext('Homecloud reset.')
    }
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [
    {
      provide: ROUTES,
      multi: true,
      useFactory: (routeConfigService: RouteConfigService): Routes => {
        routeConfigService.inject('advancedsettings', routes);
        return routes;
      },
      deps: [RouteConfigService]
    }
  ]
})
export class AdvancedSettingsRoutingModule {}