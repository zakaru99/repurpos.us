import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';


import { SafeHtml } from '@angular/platform-browser';

import { environment } from "../../environments/environment";
import { map, shareReplay, catchError } from "rxjs/operators";
import { throwError } from "rxjs";

@Injectable()
export class StructureSvgService {

  private svgCache = new Map<string, Observable<string>>();

  constructor(public http: HttpClient) {
    if (!localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', '')
    }

  }

  getSVG(query: string, format: string): Observable<string> {
    const cacheKey = `${query}|${format}`;
    const cached = this.svgCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // return this.http.get(environment.api_url + '/search', {
    const request$ = this.http.get('/api/compound_svg', {
      observe: 'response',
      // withCredentials: true,
      headers: new HttpHeaders()
        .set('Accept', 'application/json')
        .set('Authorization', localStorage.getItem('auth_token')),
      params: new HttpParams()
        .set('structure', encodeURIComponent(query))
        .set('format', format)
    }).pipe(
      map(item => {
        return item['body']['compound_svg'];
      }),
      catchError(err => {
        this.svgCache.delete(cacheKey);
        return throwError(err);
      }),
      shareReplay(1)
    );

    this.svgCache.set(cacheKey, request$);
    return request$;
  }
}
