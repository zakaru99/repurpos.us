import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// PREVIEW: what a partner's screen could look like as one record in the user
// portal, replacing the Word/Excel forms on the Workflow page. Everything here
// is sample data held in this file; nothing is loaded or saved.
//
// The page is the whole screen as a list of steps (grouped like the Workflow
// page) plus the selected step at full size. It opens on the step that's due.

type Who = 'you' | 'calibr' | 'both';
type State = 'done' | 'skipped' | 'current' | 'upcoming';

interface Step {
  key: string;
  title: string;
  who: Who;
  state: State;
  // Shown under the title in the step list, e.g. "Approved 12 Mar"
  note: string;
}

interface Phase {
  title: string;
  steps: Step[];
}

// Library size from the homepage ("13,831 clinical-stage drugs"); partners may
// take forward up to 1% as hits.
const LIBRARY_SIZE = 13831;
// Calibr IDs as in the Primary Data template, e.g. CBR-000-000-000-0
const CBR_ID = /^CBR-\d{3}-\d{3}-\d{3}-\d+$/;

@Component({
  selector: 'app-screen-preview',
  templateUrl: './screen-preview.component.html',
  styleUrls: ['./screen-preview.component.scss']
})
export class ScreenPreviewComponent implements OnInit {
  readonly screen = {
    id: 'A00981',
    title: 'Crypto-C. hominis high-content imaging proliferation',
    shortTitle: 'Crypto-C. hominis proliferation',
    institution: 'Scripps Research',
    pi: 'Dr. Jane Doe',
    started: new Date(2026, 2, 12)
  };

  readonly phases: Phase[] = [
    {
      title: 'Before screening',
      steps: [
        { key: 'proposal', title: 'Assay proposal', who: 'you', state: 'done', note: 'Approved 12 Mar' },
        { key: 'mta', title: 'Material transfer agreement', who: 'both', state: 'done', note: 'Signed 2 Apr' },
        { key: 'description', title: 'Assay description', who: 'you', state: 'done', note: 'Approved 18 Apr' },
        { key: 'layout', title: 'Plate layout', who: 'you', state: 'done', note: 'Uploaded 20 Apr' },
        { key: 'controls', title: 'Controls', who: 'you', state: 'skipped', note: 'Not sent (optional)' }
      ]
    },
    {
      title: 'Primary screen',
      steps: [
        { key: 'plates', title: 'Primary screen plates', who: 'calibr', state: 'done', note: 'Shipped 6 May' },
        { key: 'hits', title: 'Hit list', who: 'you', state: 'current', note: 'With you' }
      ]
    },
    {
      title: 'Dose response',
      steps: [
        { key: 'dr-plates', title: 'Dose-response plates', who: 'calibr', state: 'upcoming', note: 'After your hit list' },
        { key: 'dr-results', title: 'Dose-response results', who: 'you', state: 'upcoming', note: 'After the plates arrive' },
        { key: 'structures', title: 'Hit structures released', who: 'calibr', state: 'upcoming', note: 'After your results' }
      ]
    },
    {
      title: 'After screening',
      steps: [
        { key: 'publish', title: 'Data published on REFRAMEdb', who: 'calibr', state: 'upcoming', note: 'One year after release' },
        { key: 'milestones', title: 'Milestone check-ins', who: 'you', state: 'upcoming', note: 'Once a year' }
      ]
    }
  ];

  selectedKey = 'hits';

  // Phases opened by hand in the contents list; the current phase, and the
  // phase holding the selected step, are always open
  private opened: { [title: string]: boolean } = {};

  // Dates that matter to the partner, said plainly under the title
  readonly keyDates = [
    { label: 'Transfer agreement signed', value: '2 Apr 2026' },
    { label: 'Primary plates shipped', value: '6 May 2026' },
    { label: 'Data goes public', value: 'One year after your hit structures are released' }
  ];

  constructor(private route: ActivatedRoute, private router: Router) { }

  // ?step=<key> opens a step directly, so a step can be linked to
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(q => {
      const key = q.get('step');
      this.selectedKey = key && this.allSteps.some(s => s.key === key) ? key : this.current.key;
    });
  }

  // ------------------------------------------------------------ hit list form

  readonly hitLimit = Math.floor(LIBRARY_SIZE / 100);

  // Sample paste, with one ID mistyped so the checking shows
  hitText = [
    'CBR-000-000-077-1', 'CBR-000-000-112-4', 'CBR-000-000-215-2', 'CBR-000-000-301-1',
    'CBR-000-000-488-3', 'CBR-000-00-512-1', 'CBR-000-000-640-2', 'CBR-000-000-077-1'
  ].join('\n');

  hitNotes = '';
  sent = false;

  get allSteps(): Step[] {
    return this.phases.reduce((all, p) => all.concat(p.steps), [] as Step[]);
  }

  get selected(): Step {
    return this.allSteps.filter(s => s.key === this.selectedKey)[0];
  }

  get hitsStep(): Step {
    return this.allSteps.filter(s => s.key === 'hits')[0];
  }

  get current(): Step {
    return this.allSteps.filter(s => s.state === 'current')[0];
  }

  get stepNumber(): number {
    return this.allSteps.indexOf(this.selected) + 1;
  }

  select(step: Step): void {
    this.router.navigate([], {
      queryParams: { step: step.key === this.current.key ? null : step.key },
      replaceUrl: true
    });
    // Below the tablet breakpoint the list sits under the step it opens
    if (window.innerWidth < 860) {
      const detail = document.querySelector('app-screen-preview .detail');
      if (detail) { detail.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  }

  // What each step is for, shown under its heading
  readonly purposes: { [key: string]: string } = {
    'proposal': 'Tells Calibr about your assay, so they can decide whether it suits the collection.',
    'mta': 'The agreement between your institution and Calibr covering the compounds and the data from your screen.',
    'description': 'The full details of your assay. It becomes the public page for your assay on REFRAMEdb.',
    'layout': 'Tells Calibr where to put compounds and controls on your plates.',
    'controls': 'Your own controls, spotted onto the plates with the compounds. Optional.',
    'plates': 'Calibr ships the collection to you on assay-ready plates.',
    'hits': 'Tells Calibr which compounds to test again, in dose response.',
    'dr-plates': 'Calibr ships your hits again as dilution series, to confirm them.',
    'dr-results': 'Your dose-response measurements for each hit.',
    'structures': 'Calibr tells you what your confirmed hits are.',
    'publish': 'Your results become public on REFRAMEdb.',
    'milestones': 'Tells Calibr what came of your hits.'
  };

  // Steps are numbered across the whole screen, not per phase
  number(step: Step): number {
    return this.allSteps.indexOf(step) + 1;
  }

  isDone(step: Step): boolean {
    return step.state === 'done' || step.state === 'skipped';
  }

  // Each phase is done, current (holds the step that's due) or still to come
  phaseState(phase: Phase): 'done' | 'current' | 'upcoming' {
    if (phase.steps.every(s => this.isDone(s))) { return 'done'; }
    if (phase.steps.some(s => s.state === 'current' && !this.isDone(s))) { return 'current'; }
    if (phase === this.firstOpenPhase) { return 'current'; }
    return 'upcoming';
  }

  // First phase with anything left in it; that's where the screen is
  private get firstOpenPhase(): Phase {
    return this.phases.filter(p => !p.steps.every(s => this.isDone(s)))[0];
  }

  // Status of the selected step, said plainly at the top of it
  get selectedStatus(): { label: string; tone: string } {
    const s = this.selected;
    if (s.state === 'current') { return { label: s.who === 'calibr' ? 'With Calibr' : 'With you', tone: 'current' }; }
    if (s.state === 'done') { return { label: 'Done', tone: 'done' }; }
    if (s.state === 'skipped') { return { label: 'Skipped', tone: 'skipped' }; }
    return { label: 'Coming up', tone: 'upcoming' };
  }

  // Phases as the page header's tabs
  get phaseTabs(): Array<{ id: string; label: string; state: 'done' | 'current' | 'upcoming'; stateLabel: string }> {
    const said = { done: 'finished', current: 'in progress', upcoming: 'still to come' };
    return this.phases.map(p => {
      const state = this.phaseState(p);
      return { id: p.title, label: p.title, state, stateLabel: said[state] };
    });
  }

  openPhaseTab(tab: { id: string }): void {
    const phase = this.phases.filter(p => p.title === tab.id)[0];
    if (phase) { this.openPhase(phase); }
  }

  phaseOf(step: Step): Phase {
    return this.phases.filter(p => p.steps.indexOf(step) > -1)[0];
  }

  // A phase tab opens on its due step, else its first step
  openPhase(phase: Phase): void {
    const due = phase.steps.filter(s => s.state === 'current')[0];
    this.select(due || phase.steps[0]);
  }

  // Left column: what the selected step needs from the partner, or for
  // Calibr's steps, what the partner receives. Taken from the workflow
  // documents (Can I use REFRAME, Assay Description form, Plate Layout,
  // Regarding Pre-spotted Plates, Dose Response template, Milestone form).
  readonly requirements: { [key: string]: { title: string; items: string[] } } = {
    'proposal': { title: 'Requirements', items: [
      'Relevant to global health',
      'Different from prior or ongoing screens: species, strain, lifecycle stage or readout',
      'Assay volume under 50 µL, in 384- or 1536-well plates',
      'Suited to a single-point screen with under 1% hits to follow up'
    ] },
    'mta': { title: 'Requirements', items: [
      'Signed by someone authorised at your institution',
      'Data from your screen becomes public 12 months after hit structures are released'
    ] },
    'description': { title: 'Requirements', items: [
      'Short title under 50 characters',
      'Description of 100 to 200 words: the biology behind the screen, not the disease in general',
      'Protocol written in sentences, not bullet points',
      'Readout, normalization, detection method and reagent',
      'Controls with their plate positions and volumes',
      'Assay development statistics: Z′, fold change, CVs'
    ] },
    'layout': { title: 'Requirements', items: [
      'Plate type with vendor and catalog number',
      'Positions of compounds and controls on the plate',
      'Transfer volumes, typically 2.5 to 100 nL from 10 mM stock',
      'Values that match your assay description'
    ] },
    'controls': { title: 'Requirements', items: [
      'Optional',
      'Dissolved in DMSO at 10 mM',
      'About 100 µL of stock is usually enough'
    ] },
    'plates': { title: 'What you receive', items: [
      'Assay-ready plates, pre-spotted in singlicate',
      'About 0.5 nmol of each compound',
      'A compound key mapping each well to a blinded Calibr ID'
    ] },
    'hits': { title: 'Requirements', items: [
      'Calibr IDs from your compound key',
      'At most 1% of the library: 138 compounds'
    ] },
    'dr-plates': { title: 'What you receive', items: [
      'Two replicate sets of dose-response plates',
      '8-point, 1:3 dilutions from 10 µM, unless agreed otherwise',
      'One set can be used for a counter screen, once you add one'
    ] },
    'dr-results': { title: 'Requirements', items: [
      'One row per hit, by Calibr ID',
      'AC50 in molar, as a number: no < or > signs',
      'Precision: EQUAL, LESS THAN or GREATER THAN',
      'Efficacy, r², data mode and normalization'
    ] },
    'structures': { title: 'What you receive', items: [
      'Structures and names of your confirmed hits',
      'Released once your dose-response results are in'
    ] },
    'publish': { title: 'What happens', items: [
      'Dose-response data and your assay description go public on REFRAMEdb',
      'One year after structures are released',
      'Ask for a delay before then if you need one'
    ] },
    'milestones': { title: 'Requirements', items: [
      'Once a year',
      'In vivo activity, patents, publications, IND-enabling studies, grants and licensing'
    ] }
  };

  isOpen(phase: Phase): boolean {
    return !!this.opened[phase.title] || this.phaseState(phase) === 'current' ||
      phase.steps.some(s => s.key === this.selectedKey);
  }

  togglePhase(phase: Phase): void {
    this.opened[phase.title] = !this.isOpen(phase);
  }

  // One-line summary of a folded phase
  phaseSummary(phase: Phase): string {
    const state = this.phaseState(phase);
    if (state === 'done') {
      const last = phase.steps.filter(s => s.state !== 'skipped').slice(-1)[0];
      if (last && last.key === 'hits') { return 'Done today'; }
      return 'Done' + (last && last.note ? ', ' + last.note.replace(/^\S+ /, '').trim() : '');
    }
    if (state === 'current') { return 'Now'; }
    return phase.steps.length + ' steps';
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : String(n);
  }

  whoLabel(who: Who): string {
    return who === 'you' ? 'You' : who === 'calibr' ? 'Calibr' : 'You and Calibr';
  }

  // Paste is split on anything that isn't part of an ID; duplicates count once
  get hitCheck(): { valid: string[]; invalid: string[]; duplicates: number } {
    const tokens = this.hitText.split(/[\s,;]+/).map(t => t.trim().toUpperCase()).filter(t => t);
    const seen: { [id: string]: boolean } = {};
    const valid: string[] = [];
    const invalid: string[] = [];
    let duplicates = 0;
    tokens.forEach(t => {
      if (seen[t]) { duplicates++; return; }
      seen[t] = true;
      (CBR_ID.test(t) ? valid : invalid).push(t);
    });
    return { valid, invalid, duplicates };
  }

  // Hit list requirements, ticked off as the form meets them
  get hitReqs(): Array<{ text: string; met: boolean }> {
    const c = this.hitCheck;
    return [
      { text: 'Calibr IDs from your compound key, all recognised', met: c.valid.length > 0 && !c.invalid.length },
      { text: 'At most 1% of the library: ' + this.hitLimit + ' compounds', met: c.valid.length > 0 && !this.overLimit }
    ];
  }

  get overLimit(): boolean {
    return this.hitCheck.valid.length > this.hitLimit;
  }

  get canSend(): boolean {
    const c = this.hitCheck;
    return c.valid.length > 0 && !c.invalid.length && !this.overLimit;
  }

  readFile(input: HTMLInputElement): void {
    const file = input.files && input.files[0];
    if (!file) { return; }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      this.hitText = (this.hitText ? this.hitText + '\n' : '') + text;
      input.value = '';
    };
    reader.readAsText(file);
  }

  send(): void {
    if (!this.canSend) { return; }
    this.sent = true;
    this.moveOn(true);
  }

  unsend(): void {
    this.sent = false;
    this.moveOn(false);
  }

  // PREVIEW: sharing the hit list hands the screen to Calibr
  private moveOn(shared: boolean): void {
    const hits = this.allSteps.filter(s => s.key === 'hits')[0];
    const plates = this.allSteps.filter(s => s.key === 'dr-plates')[0];
    hits.state = shared ? 'done' : 'current';
    hits.note = shared ? 'Shared today' : 'With you';
    plates.state = shared ? 'current' : 'upcoming';
    plates.note = shared ? 'With Calibr' : 'After your hit list';
  }

  // ------------------------------------------------------------ reference content

  // The approved assay description as the partner submitted it: the sample
  // filled-in example from 1_AssayRegistration.Description new 1.docx
  readonly description = {
    general: [
      ['Assay title', 'Crypto-C. hominis high-content imaging proliferation'],
      ['Short title', 'Crypto-C. hominis proliferation'],
      ['Author', 'Jane Doe, PhD (Scripps Research)'],
      ['Contact', 'Dr. Jane Doe · JaneDoe@scripps.edu · (123) 456-7890'],
      ['Mailing address', '11119 N Torrey Pines Rd, La Jolla, CA 92037']
    ],
    transfer: [
      ['Assay volume', '50 µL'],
      ['Primary transfer', '50 nL from 10 mM source (10 µM final)'],
      ['Plate type', '384-well Corning 8793 (black solid bottom)'],
      ['Dose response', 'Start at 10 µM final, 1:3 dilution, 8 points']
    ],
    assay: [
      ['Indication', 'Cryptosporidiosis'],
      ['Assay type', 'Cell based, phenotypic'],
      ['Detection method', 'High-content imaging'],
      ['AC50 units', 'µM'],
      ['DMSO sensitivity', '0.5%'],
      ['Assay development', 'Pilot (triplicate plates) Z′ > 0.5, 10-fold change']
    ]
  };

  // Columns of the dose-response upload, from the "More information" sheet of
  // 3_DoseResponseData.xlsx
  readonly drColumns = [
    ['Calibr ID', 'One row per hit, using the IDs from your compound key.'],
    ['Precision', 'EQUAL if the AC50 is inside the tested range, LESS THAN for super-active compounds, GREATER THAN if it is above the curve.'],
    ['AC50 (M)', 'AC50, IC50, EC50 or CC50 in molar. A number or blank, with no < or > signs; use Precision for those.'],
    ['Efficacy', '100 for full activation, −100 for full inhibition, normalized to controls.'],
    ['r²', 'R squared of the fitted curve. A number or blank.'],
    ['Data mode', 'INCREASING, DECREASING or SUPER ACTIVE.'],
    ['Normalization', 'How the data was normalized, e.g. neutral controls minus inhibitors.']
  ];

  readonly milestones = [
    'In vivo activity in a relevant animal model',
    'Patent applications filed',
    'Publications, or a journal submission',
    'IND-enabling studies started',
    'Grant proposals funded or submitted',
    'Licensing, executed or being explored'
  ];
}
