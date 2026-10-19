import { Component, OnChanges, Input } from '@angular/core';

// Development stage as a row of steps (preclinical to launched) for one data
// source's phase vocabulary.
@Component({
  selector: 'app-clinical-phase',
  templateUrl: './clinical-phase.component.html',
  styleUrls: ['./clinical-phase.component.scss']
})
export class ClinicalPhaseComponent implements OnChanges {
  @Input() phase: string[] | string;
  @Input() vendorName: string;
  phases: Object = {
    'gvk': [
      {
        'name': 'Suspended',
        'order': -1,
        'failed': true
      },
      {
        'name': 'WITHDRAWN DRUG',
        'order': -1,
        'failed': true
      },
      {
        'name': 'Discontinued',
        'order': -1,
        'failed': true
      },
      {
        'name': 'No Development',
        'order': -1,
        'failed': true
      },
      {
        'name': 'Preclinical',
        'order': 0
      },
      {
        'name': 'Phase I',
        'label': 'I',
        'order': 1
      },
      {
        'name': 'Phase II',
        'label': 'II',
        'order': 2
      },
      {
        'name': 'Phase III',
        'label': 'III',
        'order': 3
      },
      {
        'name': 'Pre-registration',
        'order': 4
      },
      {
        'name': 'PRESCRIPTION DRUG',
        'order': 5,
        'approved': true
      },
      {
        'name': 'DRUG',
        'order': 5,
        'approved': true,
        'synonym': true
      },
      {
        'name': 'OVER THE COUNTER DRUG',
        'order': 5,
        'approved': true,
        'synonym': true
      },
      {
          // At some random stage of clinical trials
        'name': 'Clinical',
        'order': null
      },
      {
        'name': 'Clinical Phase Unknown',
        'order': null
      }],

    'integrity':
      [
        {
          'name': 'Preclinical',
          'order': 0
        },
        {
          'name': 'IND Filed',
          'order': 1
        }, {
          'name': 'Phase 0',
          'order': 2,
          'label': '0'
        }, {
          'name': 'Phase I',
          'order': 3,
          'label': 'I'
        }, {
          'name': 'Phase I/II',
          'order': 3.5
        }, {
          'name': 'Phase II',
          'order': 4,
          'label': 'II'
        },
        {
          'name': 'Phase II/III',
          'order': 4.5
        }, {
          'name': 'Phase III',
          'order': 5,
          'label': 'III'
        }, {
          'name': 'Pre-Registered',
          'order': 6,
          'label': ''
        }, {
          'name': 'Recommended Approval',
          'order': 7
        },
        {
          'name': 'Registered',
          'order': 8
        },
        {
          'name': 'Launched',
          'order': 9,
          'approved': true
        }, {
          // At some random stage of clinical trials
          'name': 'Clinical',
          'order': null
        }, {
          'name': 'Discontinued',
          'order': -1,
          'failed': true
        }, {
          'name': 'Suspended',
          'order': -1,
          'failed': true
        }, {
          'name': 'Withdrawn',
          'order': -1,
          'failed': true
        }
      ],
      'informa': [
        {
          'name': 'Discontinued',
          'order': -1,
          'failed': true
        },
        {
          'name': 'No Development Reported',
          'order': -1,
          'failed': true
        },
        {
          'name': 'Suspended',
          'order': -1,
          'failed': true
        },
        {
          'name': 'Withdrawn',
          'order': -1,
          'failed': true
        },
        {
          'name': 'Preclinical',
          'order': 0
        },
        {
          'name': 'Phase I Clinical Trial',
          'order': 1,
          label: "I",
        },
        {
          'name': 'Phase I',
          'order': 1,
          label: "I",
          synonym: true
        },
        {
          'name': 'Phase II Clinical Trial',
          'order': 2,
          label: "II"
        },
        {
          'name': 'Phase II',
          'order': 2,
          label: "II",
          synonym: true
        },
        {
          'name': 'Phase II/III Clinical Trial',
          'order': 2.5
        },
        {
          'name': 'Phase III Clinical Trial',
          'order': 3,
          label: "III"
        },
        {
          'name': 'Phase III',
          'order': 3,
          synonym: true
        },
        {
          'name': 'Pre-registered',
          'order': 4
        },
        {
          'name': 'Pre-registration',
          'order': 4,
          synonym: true
        },
        {
          'name': 'Registered',
          'order': 5
        },
        {
          'name': 'Launched',
          'order': 6,
          approved: true
        }
      ],
      // uncomment to enable adis 'adis':
      // [
      //   {
      //     'name': 'No development reported (Clinical)',
      //     'order': -1
      //   },
      //   {
      //     'name': 'Discontinued (Clinical)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Phase I',
      //     'order': 0,
      //     'label': 'I'
      //   },
      //   {
      //     'name': 'No development reported (I)',
      //     'order': 0,
      //     'label': 'I',
      //     'synonym': true

      //   },
      //   {
      //     'name': 'Discontinued (I)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Phase I/II',
      //     'order': 0.5
      //   },
      //   {
      //     'name': 'No development reported (I/II)',
      //     'order': 0.5,
      //     'synonym': true
      //   },
      //   {
      //     'name': 'Discontinued (I/II)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Phase II',
      //     'order': 1,
      //     'label': 'II'
      //   },
      //   {
      //     'name': 'No development reported (II)',
      //     'order': 1,
      //     'synonym': true
      //   },
      //   {
      //     'name': 'Suspended (II)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Discontinued (II)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Phase II/III',
      //     'order': 1.5
      //   },
      //   {
      //     'name': 'Discontinued (II/III)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Phase III',
      //     'order': 2,
      //     'label': 'III'
      //   },
      //   {
      //     'name': 'No development reported (III)',
      //     'order': 2,
      //     'synonym': true
      //   },
      //   {
      //     'name': 'Suspended (III)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Discontinued (III)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Preregistration',
      //     'order': 3
      //   },
      //   {
      //     'name': 'No development reported (Preregistration)',
      //     'order': 3,
      //     'synonym': true
      //   },
      //   {
      //     'name': 'Discontinued (Preregistration)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Preregistration Submission Withdrawal',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Registered',
      //     'order': 4
      //   },
      //   {
      //     'name': 'Discontinued (Registered)',
      //     'order': -1,
      //     'failed': true
      //   },
      //   {
      //     'name': 'Marketed',
      //     'order': 5,
      //     'approved': true
      //   },
      //   {
      //     'name': 'Market Withdrawal',
      //     'order': -1,
      //     'failed': true
      //   },       
      // ],
  }

  // Steps drawn on the track: whole stages only, no synonyms or stopped states
  sel_phases: any[] = [];
  // Furthest stage reached (null when the record only says "Clinical")
  current_phase: number = null;
  // Development stopped (discontinued, suspended, withdrawn...)
  stopped = false;

  constructor() { }

  ngOnChanges() {
    if (!this.phases.hasOwnProperty(this.vendorName)) {
      this.sel_phases = [];
      return;
    }
    this.sel_phases = this.phases[this.vendorName]
      .filter((d: any) => (d.order || d.order === 0) && d.order % 1 === 0 && d.order > -1 && d.synonym !== true);
    this.findPhase();
  }

  findPhase() {
    const given: string[] = Array.isArray(this.phase) ? this.phase : (this.phase ? [this.phase] : []);
    const matched = this.phases[this.vendorName].filter((d: any) => given.includes(d.name));
    const orders = matched.map((d: any) => d.order).filter((o: number) => o !== null && o > -1);
    // Math.max over the whole array gave NaN whenever a record had more than one phase
    this.current_phase = orders.length ? Math.max(...orders) : null;
    this.stopped = matched.some((d: any) => d.failed);
  }

  // Short label under each step; the tooltip carries the full name
  shortLabel(p: any): string {
    const short: { [name: string]: string } = {
      'Preclinical': 'Pre', 'IND Filed': 'IND', 'Pre-Registered': 'Pre-reg', 'Pre-registered': 'Pre-reg',
      'Pre-registration': 'Pre-reg', 'Recommended Approval': 'Rec.', 'Registered': 'Reg.',
      'Launched': 'Launch', 'PRESCRIPTION DRUG': 'Rx'
    };
    return p.label || short[p.name] || p.name;
  }

  stepClass(p: any): string {
    const c = this.current_phase;
    if (c === null) { return 'todo'; }
    if (p.order === c || p.order === Math.floor(c)) { return 'current'; }
    if (p.order === Math.ceil(c)) { return 'half'; } // e.g. Phase I/II: II under way
    return p.order < c ? 'done' : 'todo';
  }

}
