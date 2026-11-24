import { Injectable } from '@angular/core';

import {  HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";

import { Observable, of, throwError } from 'rxjs';
import { map, mergeMap, pluck, catchError } from 'rxjs/operators';

import { CitationService } from './citation.service';

import { AssayDetails } from '../_models';

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AssayMetadataService {

  constructor(
    private http2: HttpClient,
    private citationSvc: CitationService,
  ) { }


  retrieveAssayList(aid: string): Observable<any> {
    return this.http2.get('/api/assay_details', {
      observe: 'response',
      headers: new HttpHeaders()
        .set('Accept', 'application/json'),
      params: new HttpParams()
        .set('aid', aid)
    }).pipe(
      pluck("body"),
      // Only a failed or empty /api/assay_details response is an error (-> "Details
      // unavailable"). The citation is optional: if it fails, show the page without it.
      mergeMap((assayDetails: any) => {
        const assayMetadata = assayDetails && assayDetails[0];
        if (!assayMetadata) {
          return throwError(new Error('Assay ' + aid + ' not found'));
        }
        return this.citationSvc.getCitation([assayMetadata.bibliography]).pipe(
          catchError(() => of([])),
          map(citations => {
            assayMetadata['citations'] = citations;
            return assayMetadata;
          })
        );
      })
    )

    //   this.citationSvc.getCitation([this.assayDetails.bibliography]).subscribe(x => {
    //     this.assayDetails['citations'] = x;
    //   });
    //
    //   console.log(this.assayDetails)
    //
    //   // Set meta tags for description, etc.
    //   this.meta_tags.push({name: 'description', content: this.meta_descrip + this.assayDetails.title_short});
    //   this.meta_tags.push({property: 'og:description', content: this.meta_descrip + this.assayDetails.title_short});
    //   this.meta_tags.push({property: 'og:url', content: this.meta_url + this.aid});
    //   this.meta_tags.push({property: 'og:title', content: this.assayDetails.title_short + this.meta_title });
    //
    //   for(let i=0; i < this.meta_tags.length; i++){
    //     this.meta.updateTag(this.meta_tags[i]);
    //   }
    //
    //   // Set title for the page
    //   this.titleService.setTitle(this.assayDetails.title_short + " | reframeDB");
    // },
    //   err => { }
    // );

  }
}
