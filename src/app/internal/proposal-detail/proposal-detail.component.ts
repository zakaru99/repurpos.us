import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';

import { AdminApiService, AdminProposal, ProposalStatus } from '../admin-api.service';

// How long Approve stays armed ("Confirm approval") before reverting
const ARM_MS = 4000;

// Detail pane for one proposal. The decision bar is pinned to the bottom of
// the pane. Approve and Reject confirm in place: the same button becomes the
// confirm button, so the second click lands where the first one did. The
// status only changes once the server accepts it.
@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent implements OnChanges, OnDestroy {
  @Input() proposal: AdminProposal;
  @Output() statusChanged = new EventEmitter<{ id: number; status: ProposalStatus; reason?: string }>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('reasonInput') reasonInput: ElementRef;

  mode: 'view' | 'confirm-approve' | 'reject' = 'view';
  denialReason = '';
  saving = false;
  error = '';
  private armTimer: any;

  constructor(private api: AdminApiService) { }

  ngOnChanges() {
    this.reset();
    this.saving = false;
  }

  ngOnDestroy() {
    clearTimeout(this.armTimer);
  }

  get isPending(): boolean {
    return !!this.proposal && this.proposal.status === 'Pending';
  }

  // First click arms the button; a second click within ARM_MS approves
  onApprove() {
    if (this.mode === 'confirm-approve') {
      this.confirm();
      return;
    }
    this.mode = 'confirm-approve';
    this.error = '';
    clearTimeout(this.armTimer);
    this.armTimer = setTimeout(() => {
      if (this.mode === 'confirm-approve' && !this.saving) { this.mode = 'view'; }
    }, ARM_MS);
  }

  // First click opens the reason box; a second click (with a reason) rejects
  onReject() {
    if (this.mode === 'reject') {
      this.confirm();
      return;
    }
    this.startReject();
  }

  startReject() {
    clearTimeout(this.armTimer);
    this.mode = 'reject';
    this.error = '';
    setTimeout(() => this.reasonInput && this.reasonInput.nativeElement.focus());
  }

  cancel() {
    this.reset();
  }

  confirm() {
    const status: ProposalStatus = this.mode === 'reject' ? 'Rejected' : 'Approved';
    const reason = status === 'Rejected' ? this.denialReason.trim() : undefined;
    if (status === 'Rejected' && !reason) { return; }

    clearTimeout(this.armTimer);
    this.saving = true;
    this.error = '';
    this.api.updateProposalStatus(this.proposal.id, status, reason).subscribe({
      next: () => {
        this.saving = false;
        this.reset();
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

  private reset() {
    clearTimeout(this.armTimer);
    this.mode = 'view';
    this.denialReason = '';
    this.error = '';
  }
}
