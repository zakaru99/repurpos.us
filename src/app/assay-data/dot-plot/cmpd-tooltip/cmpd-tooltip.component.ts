import { Component, Input, OnChanges } from '@angular/core';

// Hover card for the dot plot: structure, potency and each replicate's fit.
@Component({
  selector: 'app-cmpd-tooltip',
  templateUrl: './cmpd-tooltip.component.html',
  styleUrls: ['./cmpd-tooltip.component.scss']
})
export class CmpdTooltipComponent implements OnChanges {
  @Input() public dataObj: any;
  data: any;
  left_coord: string;
  top_coord: string;

  ngOnChanges() {
    if (this.dataObj && this.dataObj.on) {
      this.data = this.dataObj.data;
      this.left_coord = this.dataObj.x + 'px';
      this.top_coord = this.dataObj.y + 'px';
    }
  }

  get typeLabel(): string {
    const t = String(this.data && this.data.value.assay_type || '');
    return /^EC/i.test(t) ? 'EC₅₀' : 'IC₅₀';
  }

  // Qualifier such as ">" for one replicate (i), or for the mean when every
  // replicate carries the same one (i = -1)
  precisionFor(i: number): string {
    const p: string[] = (this.data && this.data.value.ac_precision) || [];
    if (i >= 0) { return p[i] ? p[i] + ' ' : ''; }
    return p.length && p.every(x => x && x === p[0]) ? p[0] + ' ' : '';
  }

  // 4.2e-7 M -> "420 nM"; 3.1e-6 M -> "3.1 µM"
  conc(molar: number): string {
    if (!molar || !isFinite(molar)) { return '—'; }
    const nM = molar * 1e9;
    const sig = (x: number) => x >= 100 ? Math.round(x).toString() : x >= 10 ? x.toFixed(1).replace(/\.0$/, '') : x.toPrecision(2);
    return nM < 1000 ? sig(nM) + ' nM' : sig(nM / 1000) + ' µM';
  }
}
