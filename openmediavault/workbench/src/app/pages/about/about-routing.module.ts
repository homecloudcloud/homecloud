import { NgModule } from '@angular/core';
import { RouterModule, ROUTES, Routes } from '@angular/router';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import { RouteConfigService } from '~/app/core/services/route-config.service';
import { IsDirtyGuardService } from '~/app/shared/services/is-dirty-guard.service';
import { AboutHomecloudPageComponent } from './about-homecloud-page.component';
import { LicensesPageComponent } from './licenses/licenses-page.component';
import { CodePageComponent } from './code/code-page.component';
//import { NavigationPageComponent } from '~/app/core/pages/navigation-page/navigation-page.component';

const routes: Routes = [
  
  {
    path: '',
    component: AboutHomecloudPageComponent,
    data:{editing:true}
    //component:NavigationPageComponent
  },
  {
    path: 'code',
    component: CodePageComponent ,
    canDeactivate: [IsDirtyGuardService],
    data: {
      title: gettext('code'),
     // notificationTitle: gettext('Updated workbench settings.'),
      editing: true
    }
  },


  {
    path: 'licenses',
    component: LicensesPageComponent,
    canDeactivate: [IsDirtyGuardService],
    data: {
      title: gettext('licenses'),
     // notificationTitle: gettext('Updated workbench settings.'),
      editing: true
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
        routeConfigService.inject('system', routes);
        return routes;
      },
      deps: [RouteConfigService]
    }
  ]
})
export class AboutRoutingModule {}
