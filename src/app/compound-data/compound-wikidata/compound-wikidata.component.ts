import { Component, OnInit, Input } from '@angular/core';
import { CompoundService } from '../../_services/index';
import { WikiData } from '../../_models/vendor-data/index';

@Component({
  selector: 'app-compound-wikidata',
  templateUrl: './compound-wikidata.component.html',
  styleUrls: ['./compound-wikidata.component.scss']
})

export class CompoundWikidataComponent implements OnInit {
  public table_data: WikiData[] = [];
  public qid: string;
  open = false;

  constructor(private cmpdSvc: CompoundService) {

    this.cmpdSvc.idStates.subscribe((ids: Object) => {
      this.qid = ids['qid'];
    })

    this.cmpdSvc.wikiTableState.subscribe((wdata: WikiData[]) => {
      this.table_data = wdata || [];
      this.open = false;
    })
  }

  // The first few property names, so the closed row says what's inside
  get summary(): string {
    const names = this.table_data.map(d => d['property']);
    return names.slice(0, 4).join(', ') + (names.length > 4 ? ` and ${names.length - 4} more` : '');
  }

  ngOnInit() {
  }

}
