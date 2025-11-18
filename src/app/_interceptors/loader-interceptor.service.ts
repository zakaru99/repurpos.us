import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { MatDialog } from '@angular/material';

import { LoaderStateService } from '../_services/loader-state.service';

@Injectable()
export class LoaderInterceptorService implements HttpInterceptor {
  dialogRef: any;
	loaderCounter: number = 0;

    private excludedUrls: string[] = [
    '/suggest'
  ];

  constructor(private loaderService: LoaderStateService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (req.url.search('molfile') < 0) {
      const shouldSkip = this.excludedUrls.some(url => req.url.includes(url));

      if (!shouldSkip) {
        this.showLoader();
      }

      return next.handle(req).do(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse && !shouldSkip) {
            this.hideLoader();
          }
        },
        (err: any) => {
          if (!shouldSkip) {
            this.hideLoader();
          }
          console.log('loading complete with err');
      });
    // }
  }

  private showLoader(): void {
		this.loaderCounter += 1;
    this.loaderService.show(this.loaderCounter);
  }

  private hideLoader(): void {
		this.loaderCounter -= 1;
    this.loaderService.hide(this.loaderCounter);
  }

}
