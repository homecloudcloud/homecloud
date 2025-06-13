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
import { Injectable, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
//import { EMPTY, Observable, ReplaySubject, Subscription, timer,tap } from 'rxjs';
import { EMPTY, Observable, ReplaySubject, Subscription, timer } from 'rxjs';
import { catchError, exhaustMap, filter , withLatestFrom, map} from 'rxjs/operators';

import { AuthService } from '~/app/shared/services/auth.service';
import { RpcService } from '~/app/shared/services/rpc.service';
import { BehaviorSubject } from 'rxjs';

export type SystemInformation = {
  ts: number;
  time: string;
  hostname: string;
  version?: string;
  cpuModelName?: string;
  cpuUsage?: number;
  memTotal?: number;
  memUsed?: number;
  memAvailable?: number;
  memUtilization?: number;
  kernel?: string;
  uptime?: number;
  loadAverage?: string;
  configDirty?: boolean;
  rebootRequired?: boolean;
  availablePkgUpdates?: number;
  displayWelcomeMessage?: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class SystemInformationService implements OnDestroy {
  public readonly systemInfo$: Observable<SystemInformation>;

  private subscription: Subscription;
  private systemInfoSource = new ReplaySubject<SystemInformation>(1);
  private isVisible = new BehaviorSubject<boolean>(true);
  private visibilityHandlers: Array<() => void> = []; // Store cleanup functions

  constructor(private authService: AuthService, private rpcService: RpcService) {
    this.systemInfo$ = this.systemInfoSource.asObservable();

     /*Add visibility change listener
     document.addEventListener('visibilitychange', () => {
      this.isVisible.next(!document.hidden);
    });
    */

     // Initialize visibility state
     this.initializeVisibilityHandlers();

    // Poll the system system-information every 5 seconds. Continue, even
    // if there is a connection problem AND do not display an error
    // notification.
    this.subscription = timer(0, 5000)
      .pipe(
        // Do not request system information if user is not logged in.
        //filter(() => this.authService.isLoggedIn()),
        // Request the system information via HTTP. Execute the RPC only
        // after the previous one has been completed.
        // Check both visibility and login status
        withLatestFrom(this.isVisible),
        //tap((val) => console.log('isVisible:',this.isVisible.getValue())),
        filter(([timerValue, isVisible]) => 
          isVisible && this.authService.isLoggedIn()
        ),
        map(([timerValue, isVisible]) => timerValue),
        //tap((val) => console.log('isVisible:',this.isVisible.getValue())),
       // tap((val) => console.log('going to run rpc', val, 'at:', new Date().toISOString())),
        exhaustMap(() =>
          this.rpcService
            .request('System', 'getInformation', null, { updatelastaccess: false })
            .pipe(
              catchError((error) => {
                // Do not show an error notification.
                error.preventDefault?.();
                return EMPTY;
              })
            )
        )
      )
      .subscribe({
        next: (res: SystemInformation) => {
          // We need to convert some properties to numbers because
          // they are strings due to the 32bit compatibility of the
          // PHP backend.
          if (_.isString(res.memUsed)) {
            res.memUsed = _.parseInt(res.memUsed);
          }
          if (_.isString(res.memTotal)) {
            res.memTotal = _.parseInt(res.memTotal);
          }
          if (_.isString(res.memAvailable)) {
            res.memAvailable = _.parseInt(res.memAvailable);
          }
          if (_.isString(res.memUtilization)) {
            res.memUtilization = Number.parseFloat(res.memUtilization);
          }
          this.systemInfoSource.next(res);
        }
      });
  }
  /*private initializeVisibilityHandlers(): void {
    // Handler for standard visibility API
    const visibilityHandler = () => {
      this.updateVisibilityState(!document.hidden);
      console.log('Visibility changed:', !document.hidden);
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    this.visibilityHandlers.push(() => 
      document.removeEventListener('visibilitychange', visibilityHandler)
    );

    // Handler for when page is hidden (iOS Safari)
    const hideHandler = () => {
      // Only update visibility if the page is actually hidden
      if (document.hidden) {
      this.updateVisibilityState(false);
      console.log('Page hidden');
      }
    };
    window.addEventListener('pagehide', hideHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('pagehide', hideHandler)
    );

    // Handler for when page is shown (iOS Safari)
    const showHandler = () => {
      // Only update visibility if the page is visible
      if (!document.hidden) {
      this.updateVisibilityState(true);
      console.log('Page shown');
      }
    };
    window.addEventListener('pageshow', showHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('pageshow', showHandler)
    );

    /* Handler for window losing focus
    const blurHandler = () => {
      this.updateVisibilityState(false);
      console.log('Window lost focus');
    };
    window.addEventListener('blur', blurHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('blur', blurHandler)
    );
    */
    
      // Handler for window losing focus
    /*const blurHandler = () => {
      // Only update visibility if the page is actually hidden
      if (document.hidden) {
        this.updateVisibilityState(false);
        console.log('Window lost focus and page hidden');
      }
    };
    window.addEventListener('blur', blurHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('blur', blurHandler)
    );


    /* Handler for window gaining focus
    const focusHandler = () => {
      this.updateVisibilityState(true);
      console.log('Window gained focus');
    };
    window.addEventListener('focus', focusHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('focus', focusHandler)
    );
    */
    // Handler for window gaining focus
    /*const focusHandler = () => {
      // Only update visibility if the page is visible
      if (!document.hidden) {
        this.updateVisibilityState(true);
        console.log('Window gained focus and page visible');
      }
    };
    window.addEventListener('focus', focusHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('focus', focusHandler)
    );
  }

  private updateVisibilityState(isVisible: boolean): void {
    const currentState = this.isVisible.getValue();
    
    // Only update if state has changed
    if (currentState !== isVisible) {
      console.log(`Visibility changed from ${currentState} to ${isVisible}`);
      this.isVisible.next(isVisible);
      
      // You can add additional logic here
      if (!isVisible) {
        // Handle when page becomes invisible
        console.log('Page is now inactive');
      } else {
        // Handle when page becomes visible
        console.log('Page is now active');
      }
    }
  }


private initializeVisibilityHandlers(): void {
  // Standard Page Visibility API
  const visibilityHandler = () => {
    this.updateVisibilityState(!document.hidden);
    console.log('Visibility changed:', !document.hidden, 'at:', new Date().toISOString());
  };
  document.addEventListener('visibilitychange', visibilityHandler);
  this.visibilityHandlers.push(() => 
    document.removeEventListener('visibilitychange', visibilityHandler)
  );

  // Mobile-specific events for background detection
  if ('onpagehide' in window) {
    // iOS Safari and some mobile browsers
    const hideHandler = () => {
      // Only update if the page is actually hidden
      if (document.hidden) {
        this.updateVisibilityState(false);
        console.log('Page hidden (mobile)', 'at:', new Date().toISOString());
      }
    };
    window.addEventListener('pagehide', hideHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('pagehide', hideHandler)
    );

    const showHandler = () => {
      if (!document.hidden) {
        this.updateVisibilityState(true);
        console.log('Page shown (mobile)', 'at:', new Date().toISOString());
      }
    };
    window.addEventListener('pageshow', showHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('pageshow', showHandler)
    );
  }

  // Handle mobile focus events
  const blurHandler = () => {
    // Check if running on mobile
    if (this.isMobileDevice()) {
      if (document.hidden) {
        this.updateVisibilityState(false);
        console.log('App went to background (mobile)', 'at:', new Date().toISOString());
      }
    } else {
      // Desktop behavior
      if (document.hidden) {
        this.updateVisibilityState(false);
        console.log('Window lost focus and page hidden', 'at:', new Date().toISOString());
      }
    }
  };
  window.addEventListener('blur', blurHandler);
  this.visibilityHandlers.push(() => 
    window.removeEventListener('blur', blurHandler)
  );

  const focusHandler = () => {
    if (this.isMobileDevice()) {
      if (!document.hidden) {
        this.updateVisibilityState(true);
        console.log('App came to foreground (mobile)', 'at:', new Date().toISOString());
      }
    } else {
      // Desktop behavior
      if (!document.hidden) {
        this.updateVisibilityState(true);
        console.log('Window gained focus and page visible', 'at:', new Date().toISOString());
      }
    }
  };
  window.addEventListener('focus', focusHandler);
  this.visibilityHandlers.push(() => 
    window.removeEventListener('focus', focusHandler)
  );

  // WebKit-specific events for iOS
  if ('onwebkitvisibilitychange' in document) {
    const webkitVisibilityHandler = () => {
      this.updateVisibilityState(!document['webkitHidden']);
      console.log('Webkit visibility changed:', !document['webkitHidden'], 'at:', new Date().toISOString());
    };
    document.addEventListener('webkitvisibilitychange', webkitVisibilityHandler);
    this.visibilityHandlers.push(() => 
      document.removeEventListener('webkitvisibilitychange', webkitVisibilityHandler)
    );
  }
}
  */

private initializeVisibilityHandlers(): void {
  // Standard Page Visibility API
  const visibilityHandler = () => {
    this.updateVisibilityState(!document.hidden);
   // console.log('Visibility changed:', !document.hidden, 'at:', new Date().toISOString());
  };
  document.addEventListener('visibilitychange', visibilityHandler);
  this.visibilityHandlers.push(() => 
    document.removeEventListener('visibilitychange', visibilityHandler)
  );

  // Mobile-specific events
  if ('onpagehide' in window) {
    const hideHandler = () => {
      if (document.hidden) {
        this.updateVisibilityState(false);
      //  console.log('Page hidden (mobile)', 'at:', new Date().toISOString());
      }
    };
    window.addEventListener('pagehide', hideHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('pagehide', hideHandler)
    );

    const showHandler = () => {
      if (!document.hidden) {
        this.updateVisibilityState(true);
      //  console.log('Page shown (mobile)', 'at:', new Date().toISOString());
      }
    };
    window.addEventListener('pageshow', showHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('pageshow', showHandler)
    );
  }

  // Additional Mobile Events
  if (this.isMobileDevice()) {
    // Freeze/Resume events (Chrome Android)
    if ('onfreeze' in document) {
      const freezeHandler = () => {
        this.updateVisibilityState(false);
      //  console.log('Page frozen', 'at:', new Date().toISOString());
      };
      document.addEventListener('freeze', freezeHandler);
      this.visibilityHandlers.push(() => 
        document.removeEventListener('freeze', freezeHandler)
      );
    }

    if ('onresume' in document) {
      const resumeHandler = () => {
        this.updateVisibilityState(true);
      //  console.log('Page resumed', 'at:', new Date().toISOString());
      };
      document.addEventListener('resume', resumeHandler);
      this.visibilityHandlers.push(() => 
        document.removeEventListener('resume', resumeHandler)
      );
    }

    // App lifecycle events
    if ('onappinstalled' in window) {
      window.addEventListener('appinstalled', () => {
      //  console.log('App was installed', 'at:', new Date().toISOString());
      });
    }

    // Online/Offline events
    const onlineHandler = () => {
    //  console.log('Device is online', 'at:', new Date().toISOString());
      // Optionally restart polling if needed
    };
    window.addEventListener('online', onlineHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('online', onlineHandler)
    );

    const offlineHandler = () => {
    //  console.log('Device is offline', 'at:', new Date().toISOString());
      // Optionally pause polling
    };
    window.addEventListener('offline', offlineHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('offline', offlineHandler)
    );
  }

  /* Screen wake/lock events
  if ('screen' in window && 'onwakelog' in window.screen) {
    const wakeLockHandler = () => {
      console.log('Screen wake lock changed', 'at:', new Date().toISOString());
    };
    window.screen.addEventListener('wakelog', wakeLockHandler);
    this.visibilityHandlers.push(() => 
      window.screen.removeEventListener('wakelog', wakeLockHandler)
    );
  }
  */
  // Instead, use the proper Wake Lock API:
  if ('wakeLock' in navigator) {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await (navigator as any).wakeLock.request('screen');
      //  console.log('Wake Lock is active', 'at:', new Date().toISOString());

        wakeLock.addEventListener('release', () => {
      //    console.log('Wake Lock was released', 'at:', new Date().toISOString());
        });

      } catch (err) {
    //    console.log('Wake Lock request failed:', err);
      }
    };

    // Request wake lock when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && wakeLock === null) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.visibilityHandlers.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Release wake lock if it exists
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
      }
    });
  }
  

  // Memory pressure events
  if ('onmemorypressure' in window) {
    const memoryPressureHandler = (event: any) => {
  //    console.log('Memory pressure:', event.pressure, 'at:', new Date().toISOString());
      // Optionally reduce polling frequency
    };
    window.addEventListener('memorypressure', memoryPressureHandler);
    this.visibilityHandlers.push(() => 
      window.removeEventListener('memorypressure', memoryPressureHandler)
    );
  }

  // Battery status
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      const batteryHandler = () => {
    //    console.log('Battery level:', battery.level, 'charging:', battery.charging);
        // Optionally adjust polling based on battery
      };
      battery.addEventListener('levelchange', batteryHandler);
      battery.addEventListener('chargingchange', batteryHandler);
      this.visibilityHandlers.push(() => {
        battery.removeEventListener('levelchange', batteryHandler);
        battery.removeEventListener('chargingchange', batteryHandler);
      });
    });
  }

  // Handle mobile focus events
  const blurHandler = () => {
    if (this.isMobileDevice()) {
      if (document.hidden) {
        this.updateVisibilityState(false);
    //    console.log('App went to background (mobile)', 'at:', new Date().toISOString());
      }
    } else {
      if (document.hidden) {
        this.updateVisibilityState(false);
    //    console.log('Window lost focus and page hidden', 'at:', new Date().toISOString());
      }
    }
  };
  window.addEventListener('blur', blurHandler);
  this.visibilityHandlers.push(() => 
    window.removeEventListener('blur', blurHandler)
  );

  const focusHandler = () => {
    if (this.isMobileDevice()) {
      if (!document.hidden) {
        this.updateVisibilityState(true);
    //    console.log('App came to foreground (mobile)', 'at:', new Date().toISOString());
      }
    } else {
      if (!document.hidden) {
        this.updateVisibilityState(true);
  //      console.log('Window gained focus and page visible', 'at:', new Date().toISOString());
      }
    }
  };
  window.addEventListener('focus', focusHandler);
  this.visibilityHandlers.push(() => 
    window.removeEventListener('focus', focusHandler)
  );
}



private isMobileDevice(): boolean {
  // Check for userAgentData (modern browsers)
  if ('userAgentData' in navigator) {
    return (navigator as any).userAgentData.mobile;
  }

  // Check for touch capability and coarse pointer
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasTouch = navigator.maxTouchPoints > 0;

  // Check user agent as fallback
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check for mobile-specific events
  const hasMobileEvents = 'ontouchstart' in window;

  // Check screen size
  const isMobileSize = window.matchMedia('(max-width: 768px)').matches;

  // Combine all checks
  return (
    (hasCoarsePointer && hasTouch) || 
    mobileUA || 
    hasMobileEvents || 
    isMobileSize
  );
}

private updateVisibilityState(isVisible: boolean): void {
  const currentState = this.isVisible.getValue();
  
  if (currentState !== isVisible) {
 //   console.log(`Visibility changed from ${currentState} to ${isVisible} at: ${new Date().toISOString()}`);
    this.isVisible.next(isVisible);
    
    if (!isVisible) {
//      console.log('Page is now inactive (Background)', 'at:', new Date().toISOString());
    } else {
//      console.log('Page is now active (Foreground)', 'at:', new Date().toISOString());
    }
  }
}

  ngOnDestroy(): void {
    // Clean up all event listeners
    this.visibilityHandlers.forEach(cleanup => cleanup());
    this.visibilityHandlers = [];
    this.subscription.unsubscribe();
  }

  /*ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
    */
}