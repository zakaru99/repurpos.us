import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';

import { SKIP_LOADER_HEADER } from '../_interceptors/loader-interceptor.service';

// Structure drawings for app-struct2d. Shared by REFRAMEdb and CRESTdb (keep
// the two copies identical). Each drawing is fetched once and cached, and in
// the background: structures load lazily as they scroll into view, so they
// mustn't bring up the full-page loader.
@Injectable()
export class StructureSvgService {

  private svgCache = new Map<string, Observable<string>>();

  constructor(public http: HttpClient) {
    if (!localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', '');
    }
  }

  getSVG(query: string, format: string): Observable<string> {
    const cacheKey = `${query}|${format}`;
    const cached = this.svgCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get('/api/compound_svg', {
      observe: 'response',
      headers: new HttpHeaders()
        .set('Accept', 'application/json')
        .set('Authorization', localStorage.getItem('auth_token'))
        .set(SKIP_LOADER_HEADER, '1'),
      params: new HttpParams()
        .set('structure', encodeURIComponent(query))
        .set('format', format)
    }).pipe(
      map(item => item['body']['compound_svg']),
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
