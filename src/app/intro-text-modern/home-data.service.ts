import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { SKIP_LOADER_HEADER } from '../_interceptors/loader-interceptor.service';

export interface HomeCompound {
  id: string;
  qid: string;
  name: string;
  phase: string;
  smiles: string;
  aliases: string[];
  // [title_short, assay_id, indication]
  assays: Array<[string, string, string]>;
  similar: Array<{ compound_id: string; main_label: string; qid: string; score: number }>;
}

export interface HomeAssay {
  id: string;
  title: string;
  indication: string;
  type: string;
  published: Date;
}

// Read-only lookups for the home page previews. Each request is made once per
// session and shared, so the hero card and the explore tabs can ask for the
// same compound without a second round trip.
@Injectable({ providedIn: 'root' })
export class HomeDataService {
  private compounds = new Map<string, Observable<HomeCompound>>();
  private svgs = new Map<string, Observable<SafeUrl>>();
  private assays$: Observable<HomeAssay[]>;
  // These load in the background; don't cover the page with the global loader
  private quiet = new HttpHeaders().set(SKIP_LOADER_HEADER, '1');

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  getCompound(id: string, qid: string = ''): Observable<HomeCompound> {
    if (!this.compounds.has(id)) {
      const params = new HttpParams().set('query', id).set('type', 'string');
      const req = this.http.get<{ results: any[] }>('/api/search', { params, headers: this.quiet }).pipe(
        map(res => {
          const r = (res.results || []).find(x => x.id === id);
          if (!r) { return null; }
          return {
            id: r.id,
            qid: r.qid || qid,
            name: r.main_label,
            phase: r.highest_phase || '',
            smiles: r.smiles || '',
            aliases: (r.aliases || []).filter((a: string) => a.length < 24).slice(0, 4),
            assays: r.assay_types || [],
            similar: (r.similar_compounds || []).slice().sort((a, b) => b.score - a.score)
          } as HomeCompound;
        }),
        catchError(() => of(null)),
        shareReplay(1)
      );
      this.compounds.set(id, req);
    }
    return this.compounds.get(id);
  }

  // Returns the 2D structure for a SMILES string as an SVG data URI, or null on
  // failure. The URI is marked safe because the SVG comes from our own API
  // (same approach as Struct2dComponent).
  getStructure(smiles: string): Observable<SafeUrl> {
    if (!smiles) { return of(null); }
    if (!this.svgs.has(smiles)) {
      const params = new HttpParams().set('structure', encodeURIComponent(smiles)).set('format', 'smiles');
      const req = this.http.get<{ compound_svg: string }>('/api/compound_svg', { params, headers: this.quiet }).pipe(
        map(res => this.sanitizer.bypassSecurityTrustUrl('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(res.compound_svg))),
        catchError(() => of(null)),
        shareReplay(1)
      );
      this.svgs.set(smiles, req);
    }
    return this.svgs.get(smiles);
  }

  // Published assays, newest first. The list endpoint is large (~500 KB), so
  // callers should only ask for it when it's about to be shown.
  getPublishedAssays(): Observable<HomeAssay[]> {
    if (!this.assays$) {
      this.assays$ = this.http.get<any[]>('/api/assay_list', { headers: this.quiet }).pipe(
        map(list => list
          .filter(a => String(a.published).toLowerCase() === 'true' && a.publish_date && a.publish_date !== 'None')
          .map(a => ({
            id: a.assay_id,
            title: a.title_short || a.title,
            indication: a.indication,
            type: a.assay_type,
            published: new Date(a.publish_date)
          }))
          .filter(a => !isNaN(a.published.getTime()))
          .sort((a, b) => b.published.getTime() - a.published.getTime())),
        catchError(() => of([])),
        shareReplay(1)
      );
    }
    return this.assays$;
  }

  // Size in bytes of a static file, from a HEAD request; null if unknown.
  getFileSize(url: string): Observable<number> {
    return this.http.head(url, { observe: 'response', headers: this.quiet }).pipe(
      map(res => {
        const len = res.headers.get('content-length');
        return len ? +len : null;
      }),
      catchError(() => of(null))
    );
  }
}
