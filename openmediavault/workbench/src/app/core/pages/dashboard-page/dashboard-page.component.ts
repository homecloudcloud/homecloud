/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2024 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
import { Component, OnInit } from '@angular/core';
import { marker as gettext } from '@ngneat/transloco-keys-manager/marker';
import * as _ from 'lodash';

import { DashboardWidgetConfig } from '~/app/core/components/dashboard/models/dashboard-widget-config.model';
import { DashboardWidgetConfigService } from '~/app/core/services/dashboard-widget-config.service';
import { RpcService } from '~/app/shared/services/rpc.service';

@Component({
  selector: 'omv-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  public hotspotStatus: string = '';
  public hotspotActive: boolean = false;
  public widgets: Array<DashboardWidgetConfig> = [];

  public notConfiguredMessage: string = gettext(
    "The dashboard has not yet been configured. To personalize it, please go to the <a href='#/dashboard/settings'>settings page</a>."
  );

  constructor(private dashboardWidgetConfigService: DashboardWidgetConfigService,private rpcService:RpcService) {}

  ngOnInit(): void {
    this.getHotspotStatus();
    this.dashboardWidgetConfigService.configs$.subscribe(
      (widgets: Array<DashboardWidgetConfig>) => {
        const enabledWidgets: Array<string> = this.dashboardWidgetConfigService.getEnabled();
        this.widgets = [];
        _.forEach(enabledWidgets, (id) => {
          const widget = _.find(widgets, ['id', id]);
          if (!_.isUndefined(widget)) {
            this.widgets.push(widget);
          }
        });
      }
    );
  }

  getHotspotStatus(): void {
  //console.log('getHotspotStatus method called');
  this.rpcService.request('Homecloud', 'getHotspotStatus').subscribe({
    next: (response: any) => {
      //console.log('RPC response received:', response);
      this.hotspotStatus = response.active;
      if(this.hotspotStatus === 'Active') {
        this.hotspotActive = true;
      }
      //console.log('Hotspot status:', this.hotspotStatus);
      //console.log('Hotspot active:', this.hotspotActive);
    },
    error: (error) => {
      console.error('Error fetching hotspot status:', error);
      this.hotspotStatus = '';
      this.hotspotActive = false;
    }
  });
}

navigateToNetworkConfig(event: Event): void {
  event.preventDefault();
  // Use Angular router to navigate
  window.location.href = '/#/startconfiguration/networkconfig/interfaces';
}





}
