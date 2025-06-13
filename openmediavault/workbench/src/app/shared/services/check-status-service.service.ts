//Home cloud changes new component

import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import {  of,catchError } from 'rxjs';
import { Observable } from 'rxjs';



/*export type StatusData = {
  StatusValue: string;

};
*/
@Injectable({
  providedIn: 'root'
})
export class CheckStatusServiceService {
  scriptName:string;
  networkStatus:string;
  constructor(private http: HttpClient) {}
  //constructor() {}


  checkStatusNetwork(inputType:string):Observable<any>{
  //checkStatusNetwork(inputType:string):Observable<StatusData>{


    console.log('This is checkstatus service');
    console.log(inputType);
    if (inputType == 'Wired'){
      this.scriptName='check_wired_network_status';
      //this.networkStatus="Up";    //Hardcoding for now. Will be later retrieved by Api call below
    }
    if (inputType == 'Wifi'){
      this.scriptName='check_wifi_status';
     // this.networkStatus= "Not Connected";  //Hardcoding for now. Will be later retrieved by Api call below
    }
    if (inputType == 'Tailscale'){
      this.scriptName='check_tailscale_status';
      //this.networkStatus= "Down";  //Hardcoding for now. Will be later retrieved by Api call below
    }
    //return of({StatusValue:this.networkStatus});  //converting to Observable<StatusData>
   console.log('sending cookie now in header');
    return this.http.post<any>('https://'+window.location.hostname+':5000/'+this.scriptName,'testdata',
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'// Ensure Content-Type matches your API expectations
         // 'Access-Control-Allow-Origin':window.location.hostname,
         // 'Access-Control-Allow-Credentials': 'true'
          }),
        observe: 'response', // Observe the full response (not just the body)
        withCredentials: true,
        responseType: 'json' // Expecting JSON response
      }
    ).pipe(
      catchError(error => {
        console.error('Error:', error); // Handle error here
        return of({ error: true, message: 'An error occurred while checking network status.' }); // Return a fallback error object
      })
    );


  }
}



