import { Component, OnInit } from '@angular/core';
import { CalibrPKData } from '../../_models/index';
import { CompoundService } from '../../_services';

@Component({
  selector: 'app-compound-calibr-pk-data',
  templateUrl: './compound-calibr-pk-data.component.html',
  styleUrls: ['./compound-calibr-pk-data.component.scss']
})
export class CompoundCalibrPkDataComponent implements OnInit {

  pkData: Array<CalibrPKData> = [];
  open = false;

  // "mouse (PO, IV) and rat (PO)"
  get speciesSummary(): string {
    const by: { [species: string]: string[] } = {};
    this.pkData.forEach(x => {
      const sp = (x['Species'] || '').toLowerCase();
      by[sp] = by[sp] || [];
      if (x['Route'] && by[sp].indexOf(x['Route']) === -1) { by[sp].push(x['Route']); }
    });
    const parts = Object.keys(by).map(sp => sp + (by[sp].length ? ' (' + by[sp].join(', ') + ')' : ''));
    return parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts.join('');
  }

  constructor(private cmpdSvc: CompoundService) { }

  ngOnInit() {
        this.cmpdSvc.calibrPKDataState.subscribe((pk: CalibrPKData[]) => {
          this.pkData = pk;
        })
  }

}
