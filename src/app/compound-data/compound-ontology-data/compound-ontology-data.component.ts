import { Component } from '@angular/core';

import { VendorData } from '../../_models/index';
import { CompoundService } from '../../_services/index';

// Where the compound sits in the REFRAME mechanism-of-action ontology: one
// row per mechanism, linking into the ontology tree.
@Component({
  selector: 'app-compound-ontology-data',
  templateUrl: './compound-ontology-data.component.html',
  styleUrls: ['./compound-ontology-data.component.scss']
})
export class CompoundOntologyDataComponent {
  // Position of the ontology record in the vendor data (after integrity, gvk, informa)
  private readonly ONTOLOGY_INDEX = 3;

  open = false;

  public rows: Array<{ category: string; moa: string; path: string; source: string; src: string; node: string }> = [];

  get moaSummary(): string {
    return this.rows.map(r => r.moa).filter((m, i, a) => m && a.indexOf(m) === i).join(', ');
  }

  constructor(private cmpdSvc: CompoundService) {
    this.cmpdSvc.vendorState.subscribe((vdata: VendorData) => {
      this.rows = [];
      this.open = false;
      const entries: any[] = (vdata && vdata[this.ONTOLOGY_INDEX]) || [];
      entries.filter(x => x && x.node_id).forEach(x => {
        (x.entity_name || []).forEach((name: string, i: number) => this.rows.push({
          category: name,
          moa: (x.parent_moa || [])[i],
          path: (x.parent_moa_path || [])[i],
          source: (x.xref || [])[i],
          src: (x.entity_id || [])[i],
          node: (x.node_id || [])[i]
        }));
      });
    });
  }
}
