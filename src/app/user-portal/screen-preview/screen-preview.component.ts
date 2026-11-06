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
  // When a finished step happened, for the history table
  date?: Date;
  // Past-tense line for the history table, e.g. "Plate layout uploaded"
  done?: string;
}

interface Phase {
  title: string;
  steps: Step[];
}

// Library size from the homepage ("13,831 clinical-stage drugs"); partners may
// take forward up to 1% as hits.
const LIBRARY_SIZE = 13831;
const RFM_ID = /^RFM-\d{3}-\d{3}-\d+$/;

@Component({
  selector: 'app-screen-preview',
  templateUrl: './screen-preview.component.html',
  styleUrls: ['./screen-preview.component.scss']
})
export class ScreenPreviewComponent implements OnInit {
  readonly screen = {
    id: 'A00981',
    title: 'Crypto-C. hominis high-content imaging proliferation',
    institution: 'Scripps Research',
    pi: 'Dr. Jane Doe',
    started: new Date(2026, 2, 12)
  };

  readonly phases: Phase[] = [
    {
      title: 'Before screening',
      steps: [
        { key: 'proposal', title: 'Assay proposal', who: 'you', state: 'done', note: 'Approved 12 Mar', date: new Date(2026, 2, 12), done: 'Proposal approved' },
        { key: 'mta', title: 'Material transfer agreement', who: 'both', state: 'done', note: 'Signed 2 Apr', date: new Date(2026, 3, 2), done: 'Transfer agreement signed' },
        { key: 'description', title: 'Assay description', who: 'you', state: 'done', note: 'Approved 18 Apr', date: new Date(2026, 3, 18), done: 'Assay description approved' },
        { key: 'layout', title: 'Plate layout', who: 'you', state: 'done', note: 'Uploaded 20 Apr', date: new Date(2026, 3, 20), done: 'Plate layout uploaded' },
        { key: 'controls', title: 'Controls', who: 'you', state: 'skipped', note: 'Not sent (optional)', date: new Date(2026, 3, 20), done: 'Controls skipped (optional)' }
      ]
    },
    {
      title: 'Primary screen',
      steps: [
        { key: 'plates', title: 'Primary screen plates', who: 'calibr', state: 'done', note: 'Shipped 6 May', date: new Date(2026, 4, 6), done: 'Primary screen plates shipped' },
        { key: 'hits', title: 'Hit list', who: 'you', state: 'current', note: 'Your turn' }
      ]
    },
    {
      title: 'Dose response',
      steps: [
        { key: 'dr-plates', title: 'Dose-response plates', who: 'calibr', state: 'upcoming', note: 'Calibr, after your hit list' },
        { key: 'dr-results', title: 'Dose-response results', who: 'you', state: 'upcoming', note: 'You, after the plates arrive' },
        { key: 'structures', title: 'Hit structures released', who: 'calibr', state: 'upcoming', note: 'Calibr, after your results' }
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

  // PREVIEW: two layouts to compare, chosen with ?layout=focus|tabs
  layout: 'focus' | 'tabs' = 'focus';
  showAllHistory = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  // ?step=<key> opens a step directly, so a step can be linked to
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(q => {
      this.layout = q.get('layout') === 'tabs' ? 'tabs' : 'focus';
      const key = q.get('step');
      this.selectedKey = key && this.allSteps.some(s => s.key === key) ? key : this.current.key;
    });
  }

  // ------------------------------------------------------------ hit list form

  readonly hitLimit = Math.floor(LIBRARY_SIZE / 100);

  // Sample paste, with one ID mistyped so the checking shows
  hitText = [
    'RFM-000-077-1', 'RFM-000-112-4', 'RFM-000-215-2', 'RFM-000-301-1',
    'RFM-000-488-3', 'RFM-00-512-1', 'RFM-000-640-2', 'RFM-000-077-1'
  ].join('\n');

  stats = { zPrime: 0.52, foldChange: 10, cvDmso: 7.5, cvCompound: 10, cvControl: 15 };
  hitNotes = '';
  sent = false;

  get allSteps(): Step[] {
    return this.phases.reduce((all, p) => all.concat(p.steps), [] as Step[]);
  }

  get selected(): Step {
    return this.allSteps.filter(s => s.key === this.selectedKey)[0];
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
      queryParamsHandling: 'merge',
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
    return step.state === 'done' || step.state === 'skipped' || (this.sent && step.key === 'hits');
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
    if (s.key === 'hits' && this.sent) { return { label: 'Sent', tone: 'done' }; }
    if (s.state === 'current') { return { label: 'Your turn', tone: 'current' }; }
    if (s.state === 'done') { return { label: 'Done', tone: 'done' }; }
    if (s.state === 'skipped') { return { label: 'Skipped', tone: 'skipped' }; }
    return { label: 'Coming up', tone: 'upcoming' };
  }

  setLayout(layout: 'focus' | 'tabs'): void {
    this.router.navigate([], {
      queryParams: { layout: layout === 'focus' ? null : layout },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  phaseOf(step: Step): Phase {
    return this.phases.filter(p => p.steps.indexOf(step) > -1)[0];
  }

  // Phase tabs: open a phase on its due step, else its first step
  openPhase(phase: Phase): void {
    const due = phase.steps.filter(s => s.state === 'current')[0];
    this.select(due || phase.steps[0]);
  }

  // Focus layout: the next few steps after the due one
  get upcoming(): Step[] {
    return this.allSteps.filter(s => s.state === 'upcoming').slice(0, 3);
  }

  // Focus layout: finished steps, newest first
  get history(): Step[] {
    const done = this.allSteps.filter(s => s.date).slice().reverse();
    return this.showAllHistory ? done : done.slice(0, 3);
  }

  get historyCount(): number {
    return this.allSteps.filter(s => s.date).length;
  }

  // Dates that matter to the partner, said plainly at the top
  readonly keyDates = [
    { label: 'Transfer agreement signed', value: '2 Apr 2026' },
    { label: 'Primary plates shipped', value: '6 May 2026' },
    { label: 'Data goes public', value: 'One year after your hit structures are released' }
  ];

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
      (RFM_ID.test(t) ? valid : invalid).push(t);
    });
    return { valid, invalid, duplicates };
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
    const hits = this.allSteps.filter(s => s.key === 'hits')[0];
    hits.date = new Date();
    hits.done = 'Hit list sent (' + this.hitCheck.valid.length + ' compounds)';
  }

  unsend(): void {
    this.sent = false;
    const hits = this.allSteps.filter(s => s.key === 'hits')[0];
    hits.date = undefined;
    hits.done = undefined;
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
    ['RFM ID', 'One row per hit, using the IDs from your compound key.'],
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
