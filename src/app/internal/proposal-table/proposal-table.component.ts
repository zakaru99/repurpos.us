import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AdminProposal } from '../admin-api.service';

// Table of proposals, shared by the overview and the proposals page.
// 'compact' drops the submitter columns when the detail pane is open;
// 'waiting' shows how long each has waited instead of its status.
@Component({
  selector: 'app-proposal-table',
  templateUrl: './proposal-table.component.html',
  styleUrls: ['./proposal-table.component.scss']
})
export class ProposalTableComponent {
  @Input() proposals: AdminProposal[] = [];
  @Input() selectedId: number = null;
  @Input() compact = false;
  @Input() showWaiting = false;
  // Scroll inside a fixed-height area. The height comes from the CSS variable
  // --table-max set by the parent page (a bound style would be stripped by
  // Angular's sanitizer when it contains var()).
  @Input() scroll = false;
  @Output() pick = new EventEmitter<AdminProposal>();

  daysWaiting(p: AdminProposal): number {
    if (!p.submittedOn) { return null; }
    return Math.max(0, Math.floor((Date.now() - new Date(p.submittedOn).getTime()) / 86400000));
  }

  waitingLabel(p: AdminProposal): string {
    const d = this.daysWaiting(p);
    if (d === null) { return ''; }
    return d === 0 ? 'Today' : d === 1 ? '1 day' : d + ' days';
  }
}
