import { Component, Input, HostListener } from '@angular/core';
import { CompoundService } from '../../_services/index';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LoginStateService } from '../../_services';
import { FavoritesService } from '../../_services/favorites.service';
import { CompoundListsService, CompoundList } from '../../_services/compound-lists.service';

import { AssayData, Compound, WikiData } from '../../_models';

// Cell-line toxicity assays reported at the top of the page
const TOX_ASSAYS = [
  { id: 'A00295', cells: 'HEK293' },
  { id: 'A00296', cells: 'HepG2' },
  { id: 'A01229', cells: 'U2OS' }
];
const TOX_CUTOFF = 1e-5; // IC50 below 10 µM counts as toxic

// Top of the compound page: the navy band (name, aliases, availability, key
// figures, section nav with Save / Add to list) and the Overview: structure
// and safety notes beside the clinical data from the licensed sources, with
// identifiers collapsed underneath.
@Component({
  selector: 'app-compound-header',
  templateUrl: './compound-header.component.html',
  styleUrls: ['./compound-header.component.scss']
})
export class CompoundHeaderComponent {
  @Input() results_per_page: number;

  public label: string;
  public aliases: Array<string> = [];
  public reframeCmpd: string;
  public whoName: string;
  public chemVendors: Array<Object> = [];
  public similarityResults: Array<Compound> = [];
  public assayData: AssayData[] = [];
  public integrityPediatrics = false;
  public disclosureDate = '';
  public smiles = '';
  public highestPhase = '';

  // Chemistry (Wikidata when the compound has an item)
  public qid = '';
  public chirality = '';
  public chemData: WikiData[] = [];
  public idData: WikiData[] = [];

  // Whether the identifiers row is open
  identifiersOpen = false;

  // Which structure strings are written out in full, and which was just copied
  expandedString = '';
  copiedString = '';

  showAllAliases = false;
  // "Counterions may differ between sources" panel in the band
  showCombine = false;
  readonly aliasPreview = 8;

  compoundId = '';
  compoundName = '';
  loggedIn = false;
  lists: CompoundList[] = [];
  showListDropdown = false;
  showNotes = false;
  newListName = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any = null;

  constructor(
    private cmpdSvc: CompoundService,
    private loginStateService: LoginStateService,
    public favoritesService: FavoritesService,
    public listsService: CompoundListsService,
    private http: HttpClient
  ) {
    this.cmpdSvc.idSubject.subscribe((idData: any) => {
      this.compoundId = idData && idData.id ? idData.id : '';
    });
    this.cmpdSvc.nameState.subscribe(cmpdName => {
      this.label = cmpdName;
      this.compoundName = cmpdName || '';
    });
    this.cmpdSvc.rfmState.subscribe((rfm: string) => this.reframeCmpd = rfm);
    this.cmpdSvc.whoState.subscribe((who: string) => this.whoName = who);
    this.cmpdSvc.aliasState.subscribe((aliasList: string[]) => {
      this.aliases = (aliasList || []).filter(a => a && a !== this.label);
    });
    this.cmpdSvc.chemSourceState.subscribe((sources: Object[]) => this.chemVendors = sources);
    this.cmpdSvc.similarState.subscribe((sdata: Compound[]) => this.similarityResults = sdata || []);
    this.cmpdSvc.assaysState.subscribe((assays: AssayData[]) => this.assayData = assays || []);
    this.cmpdSvc.integrityPediatricsState.subscribe((p: boolean) => this.integrityPediatrics = p);
    this.cmpdSvc.disclosureDateState.subscribe((d: string) => this.disclosureDate = d);
    this.cmpdSvc.smilesState.subscribe((s: string) => this.smiles = s);
    this.cmpdSvc.highestPhaseState.subscribe((p: string) => this.highestPhase = p);
    this.cmpdSvc.idStates.subscribe((ids: Object) => this.qid = (ids && ids['qid']) || '');
    this.cmpdSvc.chiralityState.subscribe((c: string) => this.chirality = c);
    this.cmpdSvc.idStates.subscribe(() => this.identifiersOpen = false);
    this.cmpdSvc.wikiIDsState.subscribe((ids: Object) => {
      this.chemData = (ids && ids['chem']) || [];
      this.idData = (ids && ids['ids']) || [];
    });

    loginStateService.isUserLoggedIn.subscribe(state => this.loggedIn = state.loggedIn);
    listsService.lists$.subscribe(lists => this.lists = lists);
  }

  // ------------------------------------------------------------ derived

  get sections() {
    const s = [
      { id: 'overview', label: 'Overview' },
      { id: 'activity', label: 'Activity' },
      { id: 'development', label: 'Development' }
    ];
    if (this.similarityResults.length) { s.push({ id: 'similar', label: 'Similar compounds' }); }
    return s;
  }

  get reframeStatus(): { key: string; label: string; tooltip: string; sample: boolean } {
    const map: Record<string, { key: string; label: string; tooltip: string; sample: boolean }> = {
      plated: { key: 'plated', label: 'In the screening library', sample: true,
        tooltip: 'Included in the REFRAME screening collection' },
      one_off: { key: 'one_off', label: 'Available for one-off testing', sample: true,
        tooltip: 'Not in the screening collection, but available for one-off testing' },
      historical: { key: 'historical', label: 'Historical library compound', sample: false,
        tooltip: 'No longer included in the REFRAME screening collection' },
      historical_one_off: { key: 'historical_one_off', label: 'Historical, available for one-off testing', sample: true,
        tooltip: 'No longer in the screening collection, but available for one-off testing' },
      on_order: { key: 'on_order', label: 'On order for the library', sample: false,
        tooltip: 'On order; it will join the REFRAME screening collection soon' }
    };
    return map[this.reframeCmpd] || { key: 'not', label: 'Not in the library', sample: false,
      tooltip: 'Not included in the REFRAME screening collection' };
  }

  // Distinct assays the compound was active in
  get assayHitCount(): number {
    return new Set(this.assayData.map(a => a.assay_id)).size;
  }

  // "Run by"-style line under the title: the first few aliases
  get byline(): string {
    if (!this.aliases.length) { return ''; }
    const shown = this.aliases.slice(0, 4).join(', ');
    return 'Also known as ' + shown + (this.aliases.length > 4 ? ` and ${this.aliases.length - 4} more` : '');
  }

  get shownAliases(): string[] {
    return this.showAllAliases ? this.aliases : this.aliases.slice(0, this.aliasPreview);
  }

  // Safety and clinical notes for the top of the Overview
  // Safety and PK messages, worded as on the original page and in its order:
  // cell lines inhibited, cell lines not inhibited (each combined into one
  // sentence), then pediatric PK
  get notes(): Array<{ tone: 'warn' | 'ok' | 'info'; text: string; detail?: string }> {
    const toxic: string[] = [], clean: string[] = [];
    TOX_ASSAYS.forEach(t => {
      const hits = this.assayData.filter(x => x.assay_id === t.id && x.activity_type &&
        x.activity_type.toUpperCase() === 'IC50' && !isNaN(Number(x.ac50)));
      if (!hits.length) { return; }
      (hits.some(x => Number(x.ac50) < TOX_CUTOFF) ? toxic : clean).push(t.cells);
    });
    // "HepG2", "HepG2 and U2OS", "HEK293, HepG2 and U2OS"
    const list = (names: string[], joiner: string) =>
      names.length > 1 ? names.slice(0, -1).join(', ') + ` ${joiner} ` + names[names.length - 1] : names[0];
    const notes: Array<{ tone: 'warn' | 'ok' | 'info'; text: string; detail?: string }> = [];
    if (toxic.length) {
      notes.push({ tone: 'warn', text: `This compound has been found to inhibit growth of ${list(toxic, 'and')} cells with IC50 < 10μM` });
    }
    if (clean.length) {
      notes.push({ tone: 'ok', text: `No inhibition of ${list(clean, 'or')} cell growth at 12.5μM` });
    }
    if (this.integrityPediatrics) {
      notes.push({ tone: 'info', text: 'Drug tested for PK in pediatric patients',
        detail: '(Clarivate Pharmacokinetics Datafeed reports that this drug has been administered in a pediatric patient in a clinical study)' });
    }
    return notes;
  }

  // Closed identifiers row: "C29H31N7O · KTUF...-N · Wikidata Q123 · PubChem CID 456"
  get identifiersSummary(): string {
    const parts = [this.formula, this.inchikey];
    if (this.qid) { parts.push('Wikidata ' + this.qid); }
    const pubchem = this.idData.find(d => /pubchem/i.test(d['property'] || ''));
    if (pubchem && pubchem['values'] && pubchem['values'].length) { parts.push(pubchem['property'] + ' ' + pubchem['values'][0]); }
    return parts.filter(p => !!p).join(' · ');
  }

  // Signed out there's no clinical data beside the structure, so the
  // identifiers show open in its place
  get identifiersShown(): boolean {
    return this.identifiersOpen || !this.loggedIn;
  }

  signInPrompt() {
    window.dispatchEvent(new CustomEvent('reframe-sign-in'));
  }

  private chemValue(property: string): string {
    const p = this.chemData.find(d => d['property'] && d['property'].toLowerCase() === property.toLowerCase());
    return p && p['values'] && p['values'].length ? p['values'][0] : '';
  }

  get formula(): string { return this.chemValue('chemical formula'); }

  // Full InChIKey from Wikidata; the page ID is only its first block
  get inchikey(): string { return this.chemValue('InChIKey') || this.compoundId; }

  // Wikidata chemistry not shown elsewhere in the Overview
  get otherChem(): WikiData[] {
    const shown = ['chemical formula', 'inchikey', 'inchi', 'canonical smiles', 'isomeric smiles'];
    return this.chemData.filter(d => shown.indexOf((d['property'] || '').toLowerCase()) === -1);
  }

  // SMILES and InChI, without repeats
  get structureStrings(): Array<{ label: string; value: string }> {
    const out: Array<{ label: string; value: string }> = [];
    const add = (label: string, value: string) => {
      if (value && !out.some(o => o.value === value)) { out.push({ label, value }); }
    };
    add('SMILES', this.smiles);
    add('Isomeric SMILES', this.chemValue('isomeric SMILES'));
    add('Canonical SMILES', this.chemValue('canonical SMILES'));
    add('InChI', this.chemValue('InChI'));
    return out;
  }

  copy(value: string) {
    const done = () => {
      this.copiedString = value;
      setTimeout(() => { if (this.copiedString === value) { this.copiedString = ''; } }, 1500);
    };
    const nav: any = navigator;
    if (nav.clipboard && nav.clipboard.writeText) {
      nav.clipboard.writeText(value).then(done, () => this.showToast('Couldn\'t copy to the clipboard', 'error'));
    }
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  closeCombine() {
    this.showCombine = false;
  }

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.compoundId);
  }

  // ------------------------------------------------------------ actions

  goTo(id: string) {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  toggleFavorite(): void {
    const wasFavorite = this.isFavorite;
    this.favoritesService.toggle(this.compoundId, this.compoundName);
    this.showToast(wasFavorite ? 'Removed from favorites' : 'Saved to favorites');
  }

  addToList(listId: number): void {
    const list = this.lists.find(l => l.id === listId);
    this.listsService.addToList(listId, this.compoundId, this.compoundName).subscribe();
    this.showListDropdown = false;
    this.showToast('Added to ' + (list ? '"' + list.name + '"' : 'list'));
  }

  createAndAddList(): void {
    const name = this.newListName.trim();
    if (!name) { return; }
    this.newListName = '';
    this.showListDropdown = false;
    this.listsService.createList(name).subscribe((res: any) => {
      if (res && res.id) {
        this.listsService.addToList(res.id, this.compoundId, this.compoundName).subscribe();
        this.showToast('Added to "' + name + '"');
      } else {
        this.showToast('Created "' + name + '" — add the compound from My Lists', 'success');
      }
    });
  }

  clickedQC(vendor_ikey) {
    function saveAs(uri, filename) {
      const link = document.createElement('a');
      if (typeof link.download === 'string') {
        document.body.appendChild(link);
        link.download = filename;
        link.href = uri;
        link.click();
        document.body.removeChild(link);
      } else {
        location.replace(uri);
      }
    }

    const body = new HttpParams().set('ikey', vendor_ikey);
    this.http.post<{ data?: Array<{ upload_id: string; extension: string; file_name: string }> }>(
      'https://reframedb.org/php/getQCdownloadID.php',
      body.toString(),
      { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded') }
    ).subscribe({
      next: (response) => {
        const fileData = response.data;
        if (fileData !== undefined) {
          for (const f of fileData) {
            const filepath = '../../assets/QC_files/' + f.upload_id + f.extension;
            const file_name = f.extension === '.pdf' ? f.file_name.split('.')[0] : f.file_name;
            saveAs(filepath, file_name);
          }
        } else {
          this.showToast('QC data for this compound isn\'t available yet', 'error');
        }
      },
      error: () => this.showToast('QC data for this compound isn\'t available yet', 'error')
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimer) { clearTimeout(this.toastTimer); }
    this.toastMessage = '';
    setTimeout(() => {
      this.toastMessage = msg;
      this.toastType = type;
      this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 3000);
    }, 10);
  }
}
