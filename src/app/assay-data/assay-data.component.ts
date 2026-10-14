import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { AssayDetails } from '../_models/assay-details';
import { Stage, stageOf, statusLabel, stageClass, primaryAssayFor } from '../_models/assay-stage';
import { AssayMetadataService, AssayDataService, ColorPaletteService, LoginStateService, PrimaryDataService } from '../_services/';
import { environment } from '../../environments/environment';

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/;

// Assays whose results can't be fitted to an IC50/EC50; their confirmation
// data is a file in assets instead.
const ONE_OFFS: { [aid: string]: string } = {
  A00635: 'assets/assay_one_offs/A00635_TP Reframe Dose response.xlsx',
  A00434: 'assets/assay_one_offs/A00434.zip',
  A00236: 'assets/assay_one_offs/A00236-ReframeDeconvolution-Combined.xlsx'
};

// One assay: what it is (header and key facts), why it was run (background),
// its dose-response results (signed in) and how it was run (protocol).
@Component({
  selector: 'app-assay-data',
  templateUrl: './assay-data.component.html',
  styleUrls: ['./assay-data.component.scss']
})
export class AssayDataComponent implements OnInit, OnDestroy {
  aid: string;
  assayDetails: AssayDetails & { citations?: any[] };
  notFound = false;
  loggedIn = false;
  doseCount: number = null;      // compounds with dose-response results (from the assay list)
  doseRows: any[] = [];          // signed in: raw dose-response records, for download
  primaryRows: any[] = [];       // signed in: primary screen hit list, for download

  readonly sections = [
    { id: 'background', label: 'Background' },
    { id: 'results', label: 'Results' },
    { id: 'protocol', label: 'Protocol' }
  ];

  private subs: Subscription[] = [];
  private detailSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta,
    private assaySvc: AssayMetadataService,
    private dataSvc: AssayDataService,
    private primarySvc: PrimaryDataService,
    private colorSvc: ColorPaletteService,
    private loginState: LoginStateService
  ) { }

  ngOnInit() {
    this.subs.push(
      this.route.params.subscribe(p => this.load(p['aid'])),
      this.loginState.isUserLoggedIn.subscribe(state => {
        const was = this.loggedIn;
        this.loggedIn = !!state.loggedIn;
        if (this.loggedIn && !was && this.aid) { this.primarySvc.retrievePrimaryData(this.aid); }
      }),
      this.dataSvc.flatAssayDataSubject$.subscribe(rows => this.doseRows = rows || []),
      this.primarySvc.flatPSDDataSubject$.subscribe(rows => this.primaryRows = rows || []),
      this.colorSvc.assaysState.subscribe((list: any) => this.setDoseCount(list))
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.detailSub) { this.detailSub.unsubscribe(); }
    this.primarySvc.clearPrimaryData();
  }

  // ------------------------------------------------------------ view helpers

  get stage(): Stage {
    return stageOf(this.assayDetails && this.assayDetails.status);
  }

  get status(): string {
    return statusLabel(this.assayDetails && this.assayDetails.status);
  }

  get stageCss(): string {
    return stageClass(this.stage);
  }

  get oneOff(): string {
    return ONE_OFFS[this.aid] || null;
  }

  // First sentence of the summary, for the header
  get lede(): string {
    const s = (this.assayDetails && (this.assayDetails.summary || '')).trim();
    const m = s.match(/^.*?\.(?=\s+[A-Z])/);
    const first = m ? m[0] : s;
    return first.length > 240 ? first.slice(0, 237).replace(/\s+\S*$/, '') + '…' : first;
  }

  // Authors without the contact email, for the header: "Run by …"
  get byline(): string {
    const a = (this.assayDetails && this.assayDetails.authors || '').replace(EMAIL, '').replace(/\s+/g, ' ').trim();
    return a ? 'Run by ' + a : '';
  }

  // The contact email from the authors field, if there is one
  get contact(): string {
    const m = (this.assayDetails && this.assayDetails.authors || '').match(EMAIL);
    return m ? m[0] : '';
  }

  // "25819" -> 25819; 'secondary' / 'not available' / '0' -> null
  get primaryCount(): number {
    const n = Number(this.assayDetails && this.assayDetails.primary_screened);
    return n > 0 ? n : null;
  }

  // Secondary assays: the primary assay they follow up, if the text names it
  get primaryAssay(): string {
    const d = this.assayDetails;
    return d ? primaryAssayFor(d) : null;
  }

  get primaryNote(): string {
    const p = this.assayDetails && this.assayDetails.primary_screened;
    if (this.primaryCount) { return null; }
    if (p === 'secondary' || this.primaryAssay) { return 'Secondary assay'; }
    if (p === 'not available') { return 'Primary data not shared'; }
    return 'Primary screen data being curated';
  }

  // The API's drug_conc can carry a broken µ (U+FFFD) and doubled spaces
  get concentration(): string {
    return ((this.assayDetails && this.assayDetails.drug_conc) || '').replace(/\uFFFD/g, 'µ').replace(/\s+/g, ' ').trim();
  }

  get detailsList(): Array<{ label: string; value: string }> {
    const d = this.assayDetails;
    return [
      { label: 'Indication', value: d.indication },
      { label: 'Format', value: d.assay_type },
      { label: 'Detection', value: d.detection_method },
      { label: 'Concentration', value: this.concentration }
    ].filter(x => x.value && String(x.value).trim() && String(x.value).trim().toLowerCase() !== 'none');
  }

  signIn() {
    window.dispatchEvent(new CustomEvent('reframe-sign-in'));
  }

  // ------------------------------------------------------------ downloads

  downloadDose(format: 'csv' | 'tsv' | 'json') {
    if (!this.doseRows.length) { return; }
    // Full compound URLs, without changing the records the table uses
    const rows = this.doseRows.map(r => ({
      ...r, url: (environment.host_url + (r.url || '')).replace('/#/', '/')
    }));
    const names: { [k: string]: string } = {
      ac50: 'ac50_value', assay_type: 'assay_type(IC_or_EC)', calibr_id: 'InChIkey',
      name: 'compound_name', url: 'reframedb_url'
    };
    const body = format === 'json' ? JSON.stringify(rows) : this.delimited(rows, format === 'csv' ? ',' : '\t', names);
    this.save(body, `${this.aid}_dose-response_${this.today()}.${format}`);
  }

  downloadPrimary() {
    if (!this.primaryRows.length) { return; }
    const cols = ['ikey', 'smile', 'hit', 'assay_id', 'indication', 'assay_title'];
    const rows = this.primaryRows.map(r => cols.reduce((o, k) => { o[k] = r[k]; return o; }, {}));
    this.save(this.delimited(rows, ',', {}), `${this.aid}_primary-screening-data.csv`);
  }

  // ------------------------------------------------------------ internals

  private load(aid: string) {
    if (!aid || aid === this.aid) { return; }
    this.aid = aid;
    this.assayDetails = null;
    this.notFound = false;
    if (this.detailSub) { this.detailSub.unsubscribe(); }
    this.detailSub = this.assaySvc.retrieveAssayList(aid).subscribe(
      details => {
        this.assayDetails = details;
        this.setMeta(details);
      },
      () => this.notFound = true
    );
    if (this.loggedIn) { this.primarySvc.retrievePrimaryData(aid); }
    this.setDoseCount(this.colorSvc.assaysSubject.value);
  }

  private setDoseCount(list: any) {
    const a = list && list.assayList && list.assayList.find((x: any) => x.assay_id === this.aid);
    this.doseCount = a && Number(a.dr_screened) > 0 ? Number(a.dr_screened) : null;
  }

  private setMeta(d: AssayDetails) {
    const title = d.title_short || d.assay_title || this.aid;
    this.titleService.setTitle(`${title} | reframeDB`);
    [
      { name: 'description', content: `reframeDB assay data and protocol for ${title}` },
      { property: 'og:description', content: `reframeDB assay data and protocol for ${title}` },
      { property: 'og:url', content: `https://reframedb.org/assays/${this.aid}` },
      { property: 'og:title', content: `${title} assay data and protocol | reframeDB` }
    ].forEach(t => this.meta.updateTag(t));
  }

  private delimited(rows: any[], sep: string, names: { [k: string]: string }): string {
    if (!rows.length) { return ''; }
    const cols = Object.keys(rows[0]);
    const quote = (v: any) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    return [cols.map(c => names[c] || c).join(sep)]
      .concat(rows.map(r => cols.map(c => quote(r[c])).join(sep)))
      .join('\n') + '\n';
  }

  private save(body: string, filename: string) {
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); });
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
