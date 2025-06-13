// license-guard.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RpcService } from './rpc.service';
//import { AuthSessionService } from './auth-session.service';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
  } from '@angular/router';


export type FlagData = {
    flagValue: boolean;
  
  };

@Injectable({
  providedIn: 'root'
})
export class WizardGuardService implements CanActivate {
  //private username: string 
  constructor(
    private router: Router,
    private rpcService: RpcService,  // Your RPC service for checking license
   // private authSessionService: AuthSessionService
  ) {}

 canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    //this.username=this.authSessionService.getUsername();
    return this.rpcService.request('Flags', 'readSetUpFlags', {
        flagName: 'setup_overall_flag'
      }).pipe(
      map((response: any) => {
        if (response.flagValue === false) {
          this.router.navigate(['/landing']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/landing']);
        return of(false);
      })
    );
  }
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      return this.canActivate(childRoute, state);
    }
}
