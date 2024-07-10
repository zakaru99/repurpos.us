import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BehaviorSubject, combineLatest } from 'rxjs';

import { StructureSvgService } from "./structure-svg.service";
import { environment } from "../../environments/environment";
import { PrimaryData } from "../_models";

import * as d3 from "d3";

@Injectable({
  providedIn: 'root'
})

export class PrimaryDataService {

  primaryData: any = [];

  // Observable sources
  flatPSDDataSource = new BehaviorSubject<any[]>([]);

  // Observable streams
  flatPSDDataSubject$ = this.flatPSDDataSource.asObservable();

  constructor(
    private http2: HttpClient
  ) {

  }

  retrievePrimaryData(aid: string): void {
    // if (this.loggedIn) {
    this.http2.get('/api/data', { //api is referring to views.py
      observe: 'response',
      headers: new HttpHeaders()
        .set('Accept', 'application/json')
        .set('Authorization', localStorage.getItem('auth_token')),
      params: new HttpParams()
        .set('psd_assay', aid)
    }).subscribe((r) => {
      this.primaryData = <PrimaryData[]>r.body;
      console.log(this.primaryData)
      this.flatPSDDataSource.next(this.primaryData);
      return (this.primaryData);
    },
      error => {
        console.log('error in call to get primary data', error)
      }
    );
    // }
  }

 


  clearPrimaryData() {
    this.flatPSDDataSource.next([]);
  }
}
