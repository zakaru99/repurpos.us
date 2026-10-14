import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AssayDetails } from '../_models/index';
import { ColorPaletteService } from '../_services/index';
import { StandardizeAssayTypePipe } from '../_pipes/standardize-assay-type.pipe';

type Stage = 'Pre-screen' | 'Screening' | 'Completed' | 'Closed' | 'Other';
// What data an assay has: the header figures count and filter by these
type DataKind = 'primary' | 'dose' | 'pending' | 'secondary' | 'unavailable';
const DATA_KINDS: string[] = ['primary', 'dose', 'pending', 'secondary', 'unavailable'];

interface Row {
  assay: AssayDetails;
  title: string;
  types: string[];
  stage: Stage;
  status: string;      // status without the "ReFRAME" prefix
  primary: number;     // compounds in the primary screen (0 if none / secondary)
  dose: number;        // compounds in dose response
  text: string;        // lower-cased text the search box matches against
}

// Which stage each workflow status belongs to. Anything not listed is "Other".
const STAGES: { [status: string]: Stage } = {
  'reframe waiting for mta': 'Pre-screen',
  'reframe mta signed': 'Pre-screen',
  'reframe lopac': 'Pre-screen',
  'hts queue': 'Pre-screen',
  'reframe primary screen sent': 'Screening',
  'reframe dose response sent': 'Screening',
  'reframe dose response data received': 'Screening',
  'hts active assay ready plates': 'Screening',
  'reframe screen completed': 'Completed',
  'reframe completed but need milestones': 'Completed',
  'reframe awaiting milestones': 'Completed',
  'hts success': 'Completed',
  'crest screen completed': 'Completed',
  'reframe screen terminated and closed': 'Closed',
  'reframe project closed': 'Closed'
};

const STAGE_ORDER: Stage[] = ['Pre-screen', 'Screening', 'Completed', 'Closed', 'Other'];

// Every screen run on the library as a grid of cards, filtered by stage and
// type, a search, and the header figures (what data an assay has). Filters
// live in the URL (?query, type, stage, data) so a view can be shared and the
// homepage search can land on a filtered list.
@Component({
  selector: 'app-assays',
  templateUrl: './assays.component.html',
  styleUrls: ['./assays.component.scss']
})
export class AssaysComponent implements OnInit, OnDestroy {
  rows: Row[] = [];
  shown: Row[] = [];
  loading = true;

  query = '';
  type = '';
  stage: '' | Stage = '';
  data: '' | DataKind = '';

  // Filter options with counts, recomputed from the other active filters
  typeOptions: Array<{ value: string; n: number }> = [];
  stageOptions: Array<{ value: Stage; n: number }> = [];

  // Library-wide figures for the header; each filters to the assays it counts
  figures: Array<{ label: string; n: number; data: '' | DataKind }> = [];

  private subs: Subscription[] = [];
  private queryTimer: any;

  private readonly metaTags = [
    { property: 'og:title', content: 'reframeDB assay descriptions' },
    { name: 'description', content: 'List of assays performed on the reframeDB compound library' },
    { property: 'og:description', content: 'List of assays performed on the reframeDB compound library' },
    { property: 'og:url', content: 'https://reframedb.org/assays' }
  ];

  constructor(
    private colorSvc: ColorPaletteService,
    private titleService: Title,
    private meta: Meta,
    private stdize: StandardizeAssayTypePipe,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.titleService.setTitle('assays | reframeDB');
    this.metaTags.forEach(t => this.meta.updateTag(t));

    this.subs.push(
      this.route.queryParams.subscribe(p => {
        // Don't overwrite what's being typed (e.g. a trailing space) with the
        // trimmed value that came back through the URL
        if ((p.query || '') !== this.query.trim()) { this.query = p.query || ''; }
        this.type = p.type || '';
        this.stage = (STAGE_ORDER as string[]).includes(p.stage) ? p.stage : '';
        this.data = DATA_KINDS.includes(p.data) ? p.data : '';
        this.apply();
      }),
      this.colorSvc.assaysState.subscribe((list: any) => {
        if (!list) { return; }
        this.rows = (list.assayList as AssayDetails[]).map(a => this.toRow(a));
        this.loading = false;
        this.countFigures();
        this.apply();
      })
    );
  }

  ngOnDestroy() {
    clearTimeout(this.queryTimer);
    this.subs.forEach(s => s.unsubscribe());
  }

  get filtered(): boolean {
    return !!(this.query.trim() || this.type || this.stage || this.data);
  }

  // --- filter changes: update the URL, which re-applies through queryParams

  // Search as you type, settling briefly before touching the URL
  onQueryInput(q: string) {
    this.query = q;
    clearTimeout(this.queryTimer);
    this.queryTimer = setTimeout(() => this.navigate({ query: q.trim() }), 250);
  }

  setType(t: string) { this.navigate({ type: t }); }
  setStage(s: string) { this.navigate({ stage: s }); }

  // Clicking the active figure again turns its filter off
  toggleData(d: '' | DataKind) { this.navigate({ data: this.data === d ? '' : d }); }

  clearAll() {
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  stageClass(stage: Stage): string {
    return stage.toLowerCase().replace(/[^a-z]/g, '');
  }

  trackRow(_: number, r: Row) {
    return r.assay.assay_id;
  }

  private countFigures() {
    const n = (d: DataKind) => this.rows.filter(r => this.matchesData(r, d)).length;
    this.figures = [
      { label: 'Assays in the workflow', n: this.rows.length, data: '' },
      { label: 'Primary screen data', n: n('primary'), data: 'primary' },
      { label: 'Dose response published', n: n('dose'), data: 'dose' },
      { label: 'Dose response pending', n: n('pending'), data: 'pending' },
      { label: 'Primary data not shared', n: n('unavailable'), data: 'unavailable' }
    ];
  }

  private navigate(change: { [key: string]: string }) {
    const params = {
      query: this.query, type: this.type, stage: this.stage, data: this.data,
      ...change
    };
    // Leave empty filters out of the URL
    Object.keys(params).forEach(k => { if (!params[k]) { delete params[k]; } });
    this.router.navigate([], { relativeTo: this.route, queryParams: params, replaceUrl: true });
  }

  private toRow(a: AssayDetails): Row {
    const anyA = a as any;
    const title = anyA.title || a.assay_title || a.title_short || a.assay_id;
    const status = (a.status || '').trim();
    const primary = Number(a.primary_screened);
    const types = Array.from(new Set((a.assay_type || '')
      .split(',')
      .map(t => this.stdize.transform(t))
      .filter(t => t && t !== 'not known')));
    return {
      assay: a,
      title,
      types,
      stage: STAGES[status.toLowerCase()] || 'Other',
      status: status.replace(/^reframe\s+/i, ''),
      primary: isNaN(primary) ? 0 : primary,
      dose: Number(a.dr_screened) || 0,
      text: [a.assay_id, title, a.title_short, a.summary, a.purpose, a.indication]
        .filter(Boolean).join(' ').toLowerCase()
    };
  }

  private matchesData(r: Row, d: DataKind): boolean {
    switch (d) {
      case 'primary': return r.primary > 0;
      case 'dose': return String(r.assay.published) === 'true';
      // Not yet published, with a publication date still to come
      case 'pending': return String(r.assay.published) !== 'true' && !!r.assay.publish_date
        && r.assay.publish_date !== 'None' && new Date(r.assay.publish_date) > new Date();
      case 'secondary': return r.assay.primary_screened === 'secondary';
      case 'unavailable': return r.assay.primary_screened === 'not available';
    }
  }

  // Rows passing every active filter except the one named, so each filter's
  // counts show what choosing that option would give
  private pass(r: Row, skip: string): boolean {
    const q = this.query.trim().toLowerCase();
    return (skip === 'query' || !q || r.text.includes(q))
      && (skip === 'type' || !this.type || r.types.includes(this.type))
      && (skip === 'stage' || !this.stage || r.stage === this.stage)
      && (!this.data || this.matchesData(r, this.data));
  }

  private apply() {
    this.shown = this.rows.filter(r => this.pass(r, ''));

    this.typeOptions = this.countBy(this.rows.filter(r => this.pass(r, 'type')), r => r.types);

    const forStage = this.rows.filter(r => this.pass(r, 'stage'));
    this.stageOptions = STAGE_ORDER
      .map(s => ({ value: s, n: forStage.filter(r => r.stage === s).length }))
      .filter(o => o.n > 0 || o.value === this.stage);
  }

  private countBy(rows: Row[], keys: (r: Row) => string[]): Array<{ value: string; n: number }> {
    const counts = new Map<string, number>();
    rows.forEach(r => keys(r).forEach(k => { if (k) { counts.set(k, (counts.get(k) || 0) + 1); } }));
    return Array.from(counts.entries())
      .map(([value, n]) => ({ value, n }))
      .sort((x, y) => y.n - x.n || x.value.localeCompare(y.value));
  }
}
