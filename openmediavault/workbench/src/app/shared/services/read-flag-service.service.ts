/**Home cloud changes new component**/

import { Injectable } from '@angular/core';
import { RpcService } from './rpc.service';
import { Observable } from 'rxjs';


export type FlagData = {
  flagValue: boolean;

};


@Injectable({
  providedIn: 'root'
})
export class ReadFlagServiceService {

  constructor(private rpcService: RpcService) {}

  readLicenseFlag(username:string):Observable<FlagData>{
    return this.rpcService.request('Flags', 'readLicenseFlag', {
        username: username
      });

  }
  readLatestLicenseFlag(username:string):Observable<FlagData>{
    return this.rpcService.request('Flags', 'readLatestLicenseFlag', {
        username: username
      });

  }
  readSetUpFlags(flagName:string):Observable<FlagData>{
    console.log('readSetUpFlags called');
    return this.rpcService.request('Flags', 'readSetUpFlags', {
        flagName: flagName
      });

  }
}
