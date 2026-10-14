import { Component, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Compound } from '../../_models/index';
import { SearchResultService } from '../../_services/index';

type Match = 'all' | 'name' | 'target' | 'moa';
type Availability = 'all' | 'sample' | 'none';
type SortKey = 'availability' | 'relevance' | 'name' | 'phase' | 'assays' | 'similarity';

export interface ResultRow {
  c: Compound;
  rank: number;           // order the search returned it in
  key: string;            // InChIKey (last part of the id)
  qid: string;
  aliases: string[];      // de-duplicated
  assays: Array<{ name: string; id: string; indication: string }>;
  similar: Array<{ name: string; named: boolean; key: string; qid: string; score: number }>;
  hasSample: boolean;
  matched: string[];
}

// Where a compound stands in the collection, as people would say it
const AVAILABILITY: { [id: string]: string } = {
  plated: 'In the screening library',
  one_off: 'Available for one-off testing',
  historical_one_off: 'Historical, available for one-off testing',
  on_order: 'On order for the library',
  historical: 'Historical library compound',
  not_in_collection: 'Not in the library'
};
const AVAILABILITY_ORDER = ['plated', 'one_off', 'historical_one_off', 'on_order', 'historical', 'not_in_collection'];
const SAMPLE_AT_CALIBR = ['plated', 'one_off', 'historical_one_off'];

const PHASE_ORDER: { [phase: string]: number } = {
  'IND Filed': 1, 'Phase 0': 2, 'Clinical': 3, 'Discontinued': 4, 'Phase I': 5, 'Phase I/II': 6,
  'Phase II': 7, 'Phase II/III': 8, 'Phase III': 9, 'Pre-Registered': 10, 'Registered': 11,
  'Withdrawn': 12, 'Launched': 13
};

// Compound search results as a list: structure; name with phase and
// availability; aliases; similar library compounds (closed by default); and
// assay hits per row. Filters
// (which field matched, sample at Calibr), a sort, pages and downloads sit
// in a bar above.
@Component({
  selector: 'app-search-results-table',
  templateUrl: './search-results-table.component.html',
  styleUrls: ['./search-results-table.component.scss']
})
export class SearchResultsTableComponent implements OnDestroy {
  rows: ResultRow[] = [];
  queryString = '';
  queryType = '';
  status: 'idle' | 'done' | 'error' = 'idle';
  probSMILES = false;

  match: Match = 'all';
  availability: Availability = 'all';
  sort: SortKey = 'availability';
  page = 0;
  pageSize = 25;
  readonly pageSizes = [25, 50, 100];

  open: { [key: string]: boolean } = {};   // rows with all aliases / assays shown


  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private searchResultService: SearchResultService,
    private titleService: Title,
    private meta: Meta
  ) {
    this.subs.push(
      this.route.queryParams.subscribe(params => {
        this.queryString = params.query || '';
        this.queryType = params.mode ? `${params.mode} ${params.type}` : params.type;
        if (!this.queryString) { this.status = 'idle'; this.rows = []; }
      }),
      this.searchResultService.newSearchResult$.subscribe(result => this.load(result))
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ------------------------------------------------------------ derived lists

  get hasSimilarity(): boolean {
    return this.rows.some(r => r.c.tanimoto > 0);
  }

  get filtered(): ResultRow[] {
    const key = { name: 'name_match', target: 'target_match', moa: 'moa_match' }[this.match];
    return this.rows.filter(r =>
      (!key || r.matched.includes(key)) &&
      (this.availability === 'all' || (this.availability === 'sample') === r.hasSample));
  }

  get sorted(): ResultRow[] {
    const by: { [k: string]: (a: ResultRow, b: ResultRow) => number } = {
      relevance: (a, b) => a.rank - b.rank,
      availability: (a, b) => this.availRank(a) - this.availRank(b) || a.rank - b.rank,
      name: (a, b) => a.c.main_label.localeCompare(b.c.main_label),
      phase: (a, b) => this.phaseRank(b) - this.phaseRank(a) || a.rank - b.rank,
      assays: (a, b) => b.assays.length - a.assays.length || a.rank - b.rank,
      similarity: (a, b) => (b.c.tanimoto || 0) - (a.c.tanimoto || 0) || a.rank - b.rank
    };
    return [...this.filtered].sort(by[this.sort]);
  }

  get pageRows(): ResultRow[] {
    return this.sorted.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get from(): number {
    return this.filtered.length ? this.page * this.pageSize + 1 : 0;
  }

  get to(): number {
    return Math.min(this.filtered.length, (this.page + 1) * this.pageSize);
  }

  // Counts for the filters, each given the other filter
  matchCount(m: Match): number {
    const key = { name: 'name_match', target: 'target_match', moa: 'moa_match' }[m];
    return this.rows.filter(r => (!key || r.matched.includes(key)) &&
      (this.availability === 'all' || (this.availability === 'sample') === r.hasSample)).length;
  }

  availCount(a: Availability): number {
    const key = { name: 'name_match', target: 'target_match', moa: 'moa_match' }[this.match];
    return this.rows.filter(r => (!key || r.matched.includes(key)) &&
      (a === 'all' || (a === 'sample') === r.hasSample)).length;
  }

  // ------------------------------------------------------------ actions

  setMatch(m: Match) { this.match = m; this.page = 0; }
  setAvailability(a: Availability) { this.availability = a; this.page = 0; }
  setSort(s: SortKey) { this.sort = s; this.page = 0; }
  setPageSize(n: number) { this.pageSize = Number(n); this.page = 0; }

  go(page: number) {
    if (page >= 0 && page < this.pageCount) {
      this.page = page;
        const top = document.getElementById('results-top');
      if (top) { top.scrollIntoView({ block: 'start' }); }
    }
  }

  toggle(r: ResultRow) {
    this.open[r.key] = !this.open[r.key];
  }

  // Similar compounds start closed; the toggle under the name opens them
  toggleSimilar(r: ResultRow) {
    this.open[r.key + ':s'] = !this.open[r.key + ':s'];
  }

  // Name to show; when there's none, the InChIKey stands in
  similarName(s: { name: string; named: boolean; key: string }): string {
    return s.named ? s.name : s.key;
  }

  availabilityLabel(r: ResultRow): string {
    return AVAILABILITY[r.c.reframeid] || 'Not in the library';
  }

  trackRow(_: number, r: ResultRow) {
    return r.key;
  }

  // ------------------------------------------------------------ downloads

  downloadCSV() {
    const cols = ['name', 'inchikey', 'smiles', 'availability', 'highest_phase', 'assay_hits', 'link'];
    const quote = (v: any) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    const lines = this.sorted.map(r => [
      r.c.main_label, r.key, r.c.smiles, this.availabilityLabel(r), r.c.highest_phase || '',
      r.assays.map(a => a.id).join(' '), this.link(r)
    ].map(quote).join(','));
    this.save([cols.join(',')].concat(lines).join('\n') + '\n', 'csv', 'text/csv');
  }

  downloadSDF() {
    // Records carry SMILES and IDs as data fields (no coordinates)
    const body = this.sorted.map(r => [
      r.c.main_label || 'Unknown', '  REFRAMEDB', '',
      '  0  0  0  0  0  0  0  0  0  0999 V2000', 'M  END',
      '>  <SMILES>', r.c.smiles || '', '',
      '>  <InChIKey>', r.key, '',
      '>  <LINK>', this.link(r), '',
      '$$$$'
    ].join('\n')).join('\n') + '\n';
    this.save(body, 'sdf', 'chemical/x-mdl-sdfile');
  }

  // ------------------------------------------------------------ internals

  private load(result: any) {
    this.page = 0;
    this.open = {};
    this.match = 'all';
    this.availability = 'all';
    this.probSMILES = /[(=]/.test(this.queryString);

    if (!result || !result.data) {
      this.rows = [];
      this.status = 'error';
      return;
    }

    const list: Compound[] = Array.isArray(result.data) ? result.data : [result.data];
    this.rows = list.map((c, i) => this.toRow(c, i));
    this.status = 'done';
    this.sort = this.hasSimilarity ? 'similarity' : 'availability';

    this.titleService.setTitle(`${this.queryString} | search | reframeDB`);
    this.meta.updateTag({ property: 'og:url', content: window.location.href });
    this.meta.updateTag({ property: 'og:title', content: `search results for ${this.queryString} | reframeDB` });
    this.meta.updateTag({ property: 'og:description', content: `search results for ${this.queryType} search of ${this.queryString} | reframeDB` });
  }

  private toRow(c: any, rank: number): ResultRow {
    const last = (s: string) => String(s || '').split('/').pop();
    return {
      c,
      rank,
      key: last(c.id),
      qid: last(c.qid),
      aliases: this.dedupe(c.aliases || []).filter(a => a !== c.main_label),
      assays: (c.assay_types || []).map((a: string[]) => ({ name: a[0], id: a[1], indication: a[2] })),
      // Most similar first; some similar compounds have only an InChIKey as a name
      similar: (c.similar_compounds || [])
        .map((s: any) => ({
          name: s.main_label, key: last(s.compound_id), qid: last(s.qid), score: s.score,
          named: !!s.main_label && !/^[A-Z]{14}(-[A-Z]{10}-[A-Z])?$/.test(s.main_label)
        }))
        .sort((x: any, y: any) => y.score - x.score),
      hasSample: SAMPLE_AT_CALIBR.includes(c.reframeid),
      matched: c.matched_queries || []
    };
  }

  // Drop aliases that only differ by case, hyphens or a bracketed suffix
  private dedupe(arr: string[]): string[] {
    const seen = new Set<string>();
    return arr.filter(a => {
      const k = a.replace(/-/g, '').replace(/\(.*\)/, '').trim().toLowerCase();
      if (seen.has(k)) { return false; }
      seen.add(k);
      return true;
    });
  }

  private availRank(r: ResultRow): number {
    const i = AVAILABILITY_ORDER.indexOf(r.c.reframeid);
    return i < 0 ? AVAILABILITY_ORDER.length : i;
  }

  private phaseRank(r: ResultRow): number {
    const p = PHASE_ORDER[r.c.highest_phase];
    return p === undefined ? -1 : p;
  }

  private link(r: ResultRow): string {
    // Same link format as the old download
    return `https://reframedb.org/compound_data/${r.key}${r.qid ? '?qid=' + r.qid : ''}`;
  }

  private save(body: string, ext: string, type: string) {
    const blob = new Blob([body], { type: type + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reframedb_search_${(this.queryString || 'results').replace(/[^\w.-]+/g, '_').slice(0, 60)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); });
  }
}
