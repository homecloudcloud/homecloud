/**Home cloud changes new component**/

import { Injectable } from '@angular/core';
import { RpcService } from './rpc.service';
import { Observable } from 'rxjs';
interface LicenseData {
  'licenseVersion': string;
  'user': string;
  'accepted': boolean;
  'accepted-date': number;
  'comment': string;
}


@Injectable({
  providedIn: 'root'
})
export class SaveFlagsServiceService {

  constructor(private rpcService: RpcService) {}

  saveLicenseFlag(licenseData:LicenseData):Observable<any> {
    console.log('saveLicenseFlag called');
    
    return this.rpcService.request('Flags', 'saveLicenseFlag', {licenseData: licenseData});

  }
  saveSetUpFlags(flagName:string,flagValue:boolean):Observable<any> {
    console.log('saveSetUpFlags called');
    
    return this.rpcService.request('Flags', 'saveSetUpFlags', {flagName: flagName, flagValue: flagValue});

  }
  

}
