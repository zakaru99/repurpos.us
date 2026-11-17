import { Component, OnInit } from '@angular/core';
import { PrimaryScreenData } from '../../_models/index';
import { CompoundService } from '../../_services';

@Component({
  selector: 'app-primary-screening-data',
  templateUrl: './compound-primary-screening-data.component.html',
  styleUrls: ['./compound-primary-screening-data.component.scss']
})
export class CompoundPrimaryScreeningDataComponent implements OnInit {
  primaryData: Array<PrimaryScreenData> = [];
  hitsOnly = false;
  open = false;

  readonly columns = [
    { key: 'title_short', label: 'Assay' },
    { key: 'indication', label: 'Indication' },
    { key: 'hit', label: 'Result' }
  ];

  // Sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private cmpdSvc: CompoundService) { }

  ngOnInit() {
    this.cmpdSvc.primaryDataState.subscribe((pd: PrimaryScreenData[]) => {
      this.primaryData = pd || [];
    });
  }

  get hitCount(): number {
    return this.primaryData.filter(x => x.hit).length;
  }

  get shownRows(): PrimaryScreenData[] {
    return this.hitsOnly ? this.primaryData.filter(x => x.hit) : this.primaryData;
  }

  ariaSort(key: string): string {
    if (this.sortColumn !== key) { return null; }
    return this.sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      // Hits first on the first click
      this.sortDirection = column === 'hit' ? 'desc' : 'asc';
    }
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.primaryData.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];
      if (column === 'title_short') {
        valA = valA || a.assay_title;
        valB = valB || b.assay_title;
      }
      if (typeof valA === 'boolean' || typeof valB === 'boolean') {
        return ((valA ? 1 : 0) - (valB ? 1 : 0)) * dir;
      }
      return (valA || '').toString().toLowerCase().localeCompare((valB || '').toString().toLowerCase()) * dir;
    });
  }
}
