import { Component, Inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Proposal } from '../../_models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-proposal-detail-dialog',
  templateUrl: './proposal-detail-dialog.component.html',
  styleUrls: ['./proposal-detail-dialog.component.css']
})
export class ProposalDetailDialogComponent implements AfterViewChecked {
  // local state for rejection flow
  public showRejectForm: boolean = false;
  public denialReason: string = '';

  @ViewChild('rejectionTextarea') rejectionTextarea?: ElementRef<HTMLTextAreaElement>;
  private hasFocused: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Proposal,
    public dialogRef: MatDialogRef<ProposalDetailDialogComponent>,
    private http: HttpClient
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  approveProposal(): void{
    this.updateProposalStatus('Approved');
  }

  // show the rejection input form
  rejectProposal(): void{
    this.showRejectForm = true;
    this.hasFocused = false;
  }

  // user confirms rejection with a reason
  confirmReject(): void{
    this.updateProposalStatus('Rejected', this.denialReason);
    this.hasFocused = false;
  }

  cancelReject(): void{
    this.showRejectForm = false;
    this.denialReason = '';
    this.hasFocused = false;
  }

  ngAfterViewChecked(): void {
    if (this.showRejectForm && this.rejectionTextarea && !this.hasFocused) {
      try {
        this.rejectionTextarea.nativeElement.focus();
        this.hasFocused = true;
      } catch (e) {
        // ignore if not yet available
      }
    }
  }

  private updateProposalStatus(status: string, reason?: string): void{
    const payload: any = {
      proposal_id: this.data.id,
      status
    }

    if (reason && reason.trim()) {
      const trimmed = reason.trim();
      // send both keys to be compatible with backend expectations
      payload.denial_reason = trimmed;
    }

    console.log('Sending update payload:', payload);

    this.dialogRef.close({ updated: true, status, reason });

    this.http.post('/api/update_proposal_status', payload).subscribe({
      next: (res: any) => {
        console.log('Proposal updated', res);
      },
      error: (err) => {
        console.error('Failed to update proposal', err);
      }
    })
  }
}
