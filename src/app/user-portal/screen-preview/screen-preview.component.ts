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
      replaceUrl: true
    });
    // Below the tablet breakpoint the list sits under the step it opens
    if (window.innerWidth < 860) {
      const detail = document.querySelector('app-screen-preview .detail');
      if (detail) { detail.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
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
    if (this.canSend) { this.sent = true; }
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
