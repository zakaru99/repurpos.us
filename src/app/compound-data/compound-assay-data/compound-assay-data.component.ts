import { Component, HostListener } from '@angular/core';
import { AssayData } from '../../_models/index';
import { CompoundService } from '../../_services/index';
import { environment } from '../../../environments/environment';

// Cell-growth counter-screens: IC50 below 10 µM counts as cytotoxic
const TOX_ASSAYS = ['A00295', 'A00296', 'A01229'];
const TOX_CUTOFF = 1e-5;

@Component({
  selector: 'app-compound-assay-data',
  templateUrl: './compound-assay-data.component.html',
  styleUrls: ['./compound-assay-data.component.scss']
})
export class CompoundAssayDataComponent {
  assayData: Array<AssayData> = [];

  readonly columns = [
    { key: 'title_short', label: 'Assay' },
    { key: 'indication', label: 'Indication' },
    { key: 'activity_type', label: 'Type' },
    { key: 'ac50', label: 'Potency', num: true }
  ];

  // Sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Rows shown before "Show all"
  readonly preview = 12;
  showAll = false;
  open = true;

  // Dose-response curve images, served by the backend from the ACAS uploads S3 bucket
  curveUrlBase = environment.api_url + '/curve_image?key=';
  enlargedCurve: string = null;

  constructor(private cmpdSvc: CompoundService) {
    this.cmpdSvc.assaysState.subscribe((assays: AssayData[]) => {
      this.assayData = assays || [];
      this.showAll = false;
    });
  }

  // "8 results · most potent 46 nM in IPF fibroblast alpha-SMA"
  get summary(): string {
    const n = this.assayData.length;
    const parts = [n + (n === 1 ? ' result' : ' results')];
    const measured = this.assayData.filter(x => x.ac50 && isFinite(Number(x.ac50)));
    if (measured.length) {
      const best = measured.reduce((a, b) => Number(b.ac50) < Number(a.ac50) ? b : a);
      parts.push('most potent ' + this.conc(Number(best.ac50)) + ' in ' + (best.title_short || best.assay_id));
    }
    return parts.join(' · ');
  }

  get shownRows(): AssayData[] {
    return this.showAll ? this.assayData : this.assayData.slice(0, this.preview);
  }

  // Cell-growth counter-screens; same assays and cutoff as the Overview notes
  isToxic(x: AssayData): boolean {
    return TOX_ASSAYS.indexOf(x.assay_id) > -1 && x.activity_type === 'IC50' && !!x.ac50 && Number(x.ac50) < TOX_CUTOFF;
  }

  // 4.2e-7 M -> "420 nM"; 3.1e-6 M -> "3.1 µM" (as in the assay page tooltip)
  conc(molar: number): string {
    if (!molar || !isFinite(molar)) { return 'NA'; }
    const nM = molar * 1e9;
    const sig = (v: number) => v >= 100 ? Math.round(v).toString() : v >= 10 ? v.toFixed(1).replace(/\.0$/, '') : v.toPrecision(2);
    return nM < 1000 ? sig(nM) + ' nM' : sig(nM / 1000) + ' µM';
  }

  ariaSort(key: string): string {
    if (this.sortColumn !== key) { return null; }
    return this.sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  curveUrl(key: string): string {
    return this.curveUrlBase + encodeURIComponent(key);
  }

  openCurve(key: string) {
    this.enlargedCurve = this.curveUrl(key);
  }

  @HostListener('document:keydown.escape')
  closeCurve() {
    this.enlargedCurve = null;
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.assayData.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];
      if (column === 'title_short') {
        valA = valA || a.assay_title;
        valB = valB || b.assay_title;
      }
      // Missing values last either way
      if (valA === null || valA === undefined || valA === '') { return 1; }
      if (valB === null || valB === undefined || valB === '') { return -1; }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return valA.toString().toLowerCase().localeCompare(valB.toString().toLowerCase()) * dir;
    });
  }
}
