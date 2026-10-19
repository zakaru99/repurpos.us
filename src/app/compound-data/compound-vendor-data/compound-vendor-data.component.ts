import { Component, OnInit, Input } from '@angular/core';

import { VendorData} from '../../_models/index';
import { CompoundService } from '../../_services/index';

@Component({
  selector: 'app-compound-vendor-data',
  templateUrl: './compound-vendor-data.component.html',
  styleUrls: ['./compound-vendor-data.component.scss']
})

export class CompoundVendorDataComponent implements OnInit {
  private vendors: Array<Object> = [
    { 'name': 'Clarivate Integrity', 'link': 'https://www.cortellis.com/drugdiscovery/home', 'id': 'integrity', 'updated': ''},
    { 'name': 'GVK Excelra GoStar', 'link': 'https://gostardb.com/gostar/loginEntry.do', 'id': 'gvk', 'updated': ''},
    { 'name': 'Citeline Pharmaprojects', 'link': 'https://pharmaintelligence.informa.com/contact/contact-us', 'id': 'informa', 'updated': ''}, //needs to be above adis to work
    { 'name': 'Ontology', 'link': '/ontology-tree','id': 'ontology', 'updated': ''}, //needs to be above adis to work
    // UNCOMMENT TO  ENABLE ADIS{ 'name': 'Adis Pharmacovigilance', 'link': 'https://www.springer.com/gp/adis', 'id': 'adis', 'updated': ''},

    // { 'name': 'GVK Excelra GoStar', 'link': 'https://gostardb.com/gostar/loginEntry.do', 'id': 'gvk', 'updated': '2016-10-26'},
    // { 'name': 'Clarivate Integrity', 'link': 'https://integrity.thomson-pharma.com/integrity/xmlxsl/pk_home.util_home', 'id': 'integrity', 'updated': '2017-02-09'},
    // { 'name': 'Citeline Pharmaprojects', 'link': 'https://pharmaintelligence.informa.com/contact/contact-us', 'id': 'informa', 'updated': '2017-01-23'},
  ];

  public vendor_data: VendorData;

  // One block per data source that has something to show, each entry with its
  // phase worked out once (the template used to recompute it on every check)
  // Selected source tab
  public active = 0;
  public sources: Array<{ meta: any; entries: Array<{ x: any; phase: { title: string; text: string; values: string[] } }> }> = [];

  // Mirrors PHASE_ORDER in search-results-table.component.ts and
  // best_phase()/PHASE_ORDER in repurpos-backend views.py.
  private PHASE_ORDER: { [key: string]: number } = {
    'IND Filed': 1,
    'Phase 0': 2,
    'Clinical': 3,
    'Discontinued': 4,
    'Phase I': 5,
    'Phase I/II': 6,
    'Phase II': 7,
    'Phase II/III': 8,
    'Phase III': 9,
    'Pre-Registered': 10,
    'Registered': 11,
    'Withdrawn': 12,
    'Launched': 13
  };

  constructor(private cmpdSvc: CompoundService) {
    this.cmpdSvc.vendorState.subscribe((vdata: VendorData) => {
      this.vendor_data = vdata;
      this.sources = this.buildSources(vdata);
      this.active = 0;
    });
  }

  ngOnInit() {
  }

  // A combo product (Cortellis "Integrity" combo_phase) can be further along than the
  // single agent alone, e.g. a monotherapy still in Phase II that's part of a Launched
  // combo. Surface the more advanced of the two as the displayed highest phase.
  public hasDisplayPhase(x: any, vendorId?: string): boolean {
    if (vendorId !== 'integrity') {
      return false;
    }

    const comboPhases = Array.isArray(x && x['combo_phase']) ? x['combo_phase'] : [];
    return comboPhases.some((c: string) => !!c && this.PHASE_ORDER[c] !== undefined);
  }

  public displayHighestPhase(x: any, vendorId?: string): string {
    if (vendorId !== 'integrity') {
      const values = this.getDisplayPhaseValues(x, vendorId);
      return values.length > 0 ? values[0] : '';
    }

    const candidates = this.getPhaseCandidates(x);
    const ranked = candidates.filter((c: string) => !!c && this.PHASE_ORDER[c] !== undefined);
    if (ranked.length === 0) {
      return candidates.find((c: string) => !!c) || '';
    }
    return ranked.reduce((a, b) => this.PHASE_ORDER[b] > this.PHASE_ORDER[a] ? b : a);
  }

  public getDisplayPhaseValues(x: any, vendorId?: string): string[] {
    if (vendorId === 'integrity' && this.hasDisplayPhase(x, vendorId)) {
      return this.getPhaseCandidates(x);
    }

    const phaseValue = x && x['phase'];
    if (Array.isArray(phaseValue)) {
      return phaseValue;
    }

    const highestPhase = x && x['highest_phase'];
    return highestPhase ? [highestPhase] : [];
  }

  public getDisplayPhaseTitle(x: any, vendorId?: string): string {
    if (vendorId === 'integrity' && this.hasDisplayPhase(x, vendorId)) {
      return 'Highest Phase:';
    }

    return x && x['highest_phase'] ? 'Highest Phase:' : 'Phase:';
  }

  private buildSources(vdata: any): Array<any> {
    if (!vdata || !vdata.length) { return []; }
    const out = [];
    vdata.forEach((vendor: any[], k: number) => {
      const meta: any = this.vendors[k];
      if (!meta || meta['id'] === 'ontology' || !vendor || !vendor.length) { return; }
      const v0 = vendor[0] || {};
      if (!(v0.ikey || v0.drug_name || v0.phase || v0.gvk_id || v0.id || v0.informa_id)) { return; }
      out.push({
        meta,
        entries: vendor.filter(x => !!x).map(x => ({ x, phase: this.phaseInfo(x, meta['id']) }))
      });
    });
    return out;
  }

  // Phase line for one entry: the combo-elevated highest phase for Integrity,
  // otherwise the source's own phase or highest phase
  private phaseInfo(x: any, vendorId: string): { title: string; text: string; values: string[] } {
    if (this.hasDisplayPhase(x, vendorId)) {
      const text = this.displayHighestPhase(x, vendorId);
      return { title: 'Highest phase', text, values: [text] };
    }
    if ((x.hasOwnProperty('phase') && x['phase'].length > 0) || x.hasOwnProperty('highest_phase')) {
      return {
        title: this.getDisplayPhaseTitle(x, vendorId) === 'Phase:' ? 'Phase' : 'Highest phase',
        text: this.displayHighestPhase(x, vendorId),
        values: this.getDisplayPhaseValues(x, vendorId)
      };
    }
    return null;
  }

  private getPhaseCandidates(x: any): string[] {
    const candidates: string[] = [];

    const addCandidate = (value: any) => {
      if (Array.isArray(value)) {
        candidates.push(...value);
      } else if (value) {
        candidates.push(value);
      }
    };

    addCandidate(x && x['highest_phase']);
    addCandidate(x && x['phase']);
    addCandidate(x && x['combo_phase']);

    return candidates;
  }

}
