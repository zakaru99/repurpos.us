import { Component, OnDestroy } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';

import { AssayDataService } from '../../_services';

// Pages of compounds in the dot plot, with the range on screen.
@Component({
  selector: 'app-assay-pagination',
  templateUrl: './assay-pagination.component.html',
  styleUrls: ['./assay-pagination.component.scss']
})
export class AssayPaginationComponent implements OnDestroy {
  pages: number[] = [];
  current_page = 0;
  total = 0;
  private perPage = 1;

  private subs: Subscription[] = [];

  constructor(private dataSvc: AssayDataService) {
    this.subs.push(
      combineLatest(this.dataSvc.totalPageSubject$, this.dataSvc.currentAssayTypeSubject$, this.dataSvc.assayDataSubject$)
        .subscribe(([pages, assayType, nested]) => {
          const info = pages && assayType && pages[assayType];
          const group = (nested || []).find((d: any) => d.key === assayType);
          this.pages = info ? Array.from({ length: info.totalPages }, (_, i) => i) : [];
          this.perPage = info ? info.numPerPage : 1;
          this.total = group ? group.values.length : 0;
        }),
      this.dataSvc.currentPageSubject$.subscribe(n => this.current_page = n)
    );
  }

  get from(): number {
    return this.total ? this.current_page * this.perPage + 1 : 0;
  }

  get to(): number {
    return Math.min(this.total, (this.current_page + 1) * this.perPage);
  }

  go(page: number) {
    if (page < 0 || page >= this.pages.length || page === this.current_page) { return; }
    this.dataSvc.currentPageSource.next(page);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
