import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';

import { AdminApiService, AdminProposal, ProposalStatus } from '../admin-api.service';

// Detail pane for one proposal, with approve / reject. Both actions ask for
// confirmation, and the status only changes once the server accepts it.
@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent implements OnChanges {
  @Input() proposal: AdminProposal;
  @Output() statusChanged = new EventEmitter<{ id: number; status: ProposalStatus; reason?: string }>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('reasonInput') reasonInput: ElementRef;

  mode: 'view' | 'confirm-approve' | 'reject' = 'view';
  denialReason = '';
  saving = false;
  error = '';

  constructor(private api: AdminApiService) { }

  ngOnChanges() {
    this.mode = 'view';
    this.denialReason = '';
    this.saving = false;
    this.error = '';
  }

  get isPending(): boolean {
    return !!this.proposal && this.proposal.status === 'Pending';
  }

  startApprove() {
    this.mode = 'confirm-approve';
    this.error = '';
  }

  startReject() {
    this.mode = 'reject';
    this.error = '';
    setTimeout(() => this.reasonInput && this.reasonInput.nativeElement.focus());
  }

  cancel() {
    this.mode = 'view';
    this.denialReason = '';
    this.error = '';
  }

  confirm() {
    const status: ProposalStatus = this.mode === 'reject' ? 'Rejected' : 'Approved';
    const reason = status === 'Rejected' ? this.denialReason.trim() : undefined;
    if (status === 'Rejected' && !reason) { return; }

    this.saving = true;
    this.error = '';
    this.api.updateProposalStatus(this.proposal.id, status, reason).subscribe({
      next: () => {
        this.saving = false;
        this.mode = 'view';
        this.statusChanged.emit({ id: this.proposal.id, status, reason });
      },
      error: () => {
        this.saving = false;
        const verb = status === 'Rejected' ? 'reject' : 'approve';
        this.error = 'Could not ' + verb + ' this proposal. Please try again.';
      }
    });
  }

  exportJson() {
    const blob = new Blob([JSON.stringify(this.proposal, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reframe-proposal-' + this.proposal.id + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
