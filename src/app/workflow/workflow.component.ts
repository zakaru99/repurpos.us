import { Component } from '@angular/core';

// Screening workflow for partners: the stages of a ReFRAME screen, with who
// does each step, and the forms used along the way.
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent {
  readonly lede = 'To ensure a successful and efficient screen, please review the entire process. ' +
    'Standardized, linear-staged workflows and automation allow us to work with many partners at once. ' +
    'While we can sometimes accommodate alternative workflows, it is important to finalize everything before screening begins.';

  sections = [
    { id: 'before', label: 'Before screening' },
    { id: 'round-1', label: 'Screening round 1' },
    { id: 'counter', label: 'Counter screens' },
    { id: 'after', label: 'After screening' },
    { id: 'forms', label: 'Forms and templates' }
  ];

  // Everything a partner downloads or fills in, in the order it's needed
  forms = [
    { label: 'Assay proposal', note: 'Online form', link: '/assay_proposal' },
    { label: 'Assay description', note: 'Word', href: 'assets/workflow/1_AssayRegistration.Description new 1.docx' },
    { label: 'Standard usage: can I use ReFRAME?', note: 'Word', href: 'assets/workflow/0_Can_I_use_Reframe.docx' },
    { label: 'Quantity exception', note: 'Word', href: 'assets/workflow/supplemental_QuantityException.docx' },
    { label: 'Regarding pre-spotted plates', note: 'Word', href: 'assets/workflow/1_Regarding Pre-spotted Plates.docx' },
    { label: 'Primary data template', note: 'Excel', href: 'assets/workflow/2_PrimaryDataTemplate 3.xlsx' },
    { label: 'Dose response data template', note: 'Excel', href: 'assets/workflow/3_DoseResponseData.xlsx' },
    { label: 'Milestone check-in', note: 'Word', href: 'assets/workflow/3_Milestone_Check_In.docx' }
  ];
}
