import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AssayDataService } from '../../_services/index';

// IC50 / EC50 / Inactive switch for the dot plot, each with its compound count.
@Component({
  selector: 'app-assay-type-btn',
  templateUrl: './assay-type-btn.component.html',
  styleUrls: ['./assay-type-btn.component.scss']
})
export class AssayTypeBtnComponent implements OnDestroy {
  types: Array<{ key: string; n: number }> = [];
  current = '';

  private subs: Subscription[] = [];

  constructor(private dataSvc: AssayDataService) {
    const order = ['IC50', 'EC50', 'Inactive'];
    this.subs.push(
      dataSvc.assayDataSubject$.subscribe(nested => {
        this.types = (nested || [])
          .map((d: any) => ({ key: d.key, n: d.values.length }))
          .sort((a, b) => (order.indexOf(a.key) + 1 || 9) - (order.indexOf(b.key) + 1 || 9));
      }),
      dataSvc.currentAssayTypeSubject$.subscribe(t => this.current = t)
    );
  }

  // Switching type starts again from the first page
  select(type: string) {
    if (type === this.current) { return; }
    this.dataSvc.currentAssayTypeSource.next(type);
    this.dataSvc.currentPageSource.next(0);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
