/**Home cloud changes new component**/

import { Injectable } from '@angular/core';
import { RpcService } from '~/app/shared/services/rpc.service';
import { Observable } from 'rxjs';


export type LicenseTextData = {
  licenseVersion: string;
  latest:boolean;
  licenseText: string;

};

@Injectable({
  providedIn: 'root'
})
export class ReadLicenseTextServiceService {

  constructor(private rpcService:RpcService) {}

  readLicenseText():Observable<LicenseTextData>{
    console.log("readLicenseText called");
    return this.rpcService.request('Flags', 'readLicenseText',{});

  }
}
