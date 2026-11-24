import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { Observable, forkJoin, of } from 'rxjs';
import { map, pluck, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})


export class CitationService {
  reframe_pmid: string = "30282735";

  entrez_stub = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
  // ex: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=18579783&retmode=xml&rettype=abstract
  // NCBI's citation API (https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=csl&id=...)
  // stopped sending CORS headers, so the backend fetches it for us.
  citation_url = '/api/citation';

  // DEAD as of November 2018: 'https://www.ncbi.nlm.nih.gov/pmc/utils/ctxp';


  // https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=csl&id=30282735 ??
  // ex https://www.ncbi.nlm.nih.gov/pmc/utils/ctxp?ids=PMC2440361&report=citeproc';
  // NOTE: only works if PMID also has PMCID (grr)
  citations: Object[] = [];
  result = [];

  constructor(private http: HttpClient) { }

  // Only all-digit values are looked up; anything else (e.g. "In progress" or a
  // pasted reference) is skipped. A failed lookup is dropped, never an error.
  getCitation(pmids: string[]): Observable<Object[]> {
    const valid = (pmids || [])
      .map(d => d == null ? '' : String(d).trim())
      .filter(d => /^\d+$/.test(d));
    if (!valid.length) {
      return of([]);
    }
    return forkJoin(valid.map(d => this.getNCBI(d).pipe(catchError(() => of(null))))).pipe(
      map(results => results.filter(c => c && !Array.isArray(c)))
    );
  }

  // getEntrez(pmid: string): void {
  //   console.log('calling NCBI')
  //   this.http.get(this.entrez_stub, {
  //     observe: 'response',
  //     responseType: 'text',
  //     headers: new HttpHeaders(),
  //     // .set('Accept', 'text'),
  //     // .set('Authorization', localStorage.getItem('auth_token')),
  //     params: new HttpParams()
  //       .set('db', 'pubmed')
  //       .set('id', pmid)
  //       .set('retmode', 'text')
  //       .set('rettype', 'abstract')
  //   }).subscribe((r) => {
  //     console.log(r);
  //     let v = r.body;
  //     // console.log('structure returned from service');
  //     console.log(v);
  //
  //   },
  //     err => {
  //       console.log('err in call to NCBI')
  //       console.log(err)
  //     }
  //   );
  // }
  //


  // CSL-JSON for one PMID, via the backend's NCBI proxy.
  getNCBI(pmid: string): Observable<Object> {
    return this.http.get(this.citation_url, {
      observe: 'response',
      responseType: 'json',
      params: new HttpParams().set('pmid', pmid)
    }).pipe(
      pluck("body"))
  }
}
