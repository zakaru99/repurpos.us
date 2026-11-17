import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { finalize, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { LoaderStateService } from '../_services/loader-state.service';

// Set on a request to keep the full-page loading overlay hidden while it runs
export const SKIP_LOADER_HEADER = 'X-Skip-Loader';

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
      // Background requests (e.g. homepage previews) opt out with this header
      const quiet = req.headers.has(SKIP_LOADER_HEADER);
      if (quiet) {
        req = req.clone({ headers: req.headers.delete(SKIP_LOADER_HEADER) });
      }
      const shouldSkip = quiet || this.excludedUrls.some(url => req.url.includes(url));

      if (!shouldSkip) {
        this.showLoader();
      }

      return next.handle(req).pipe(
        tap({
          error: () => console.log('loading complete with err')
        }),
        finalize(() => {
          if (!shouldSkip) {
            this.hideLoader();
          }
        })
      );
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
