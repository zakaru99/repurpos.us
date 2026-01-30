import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Proposal } from '../../_models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-proposal-detail-dialog',
  templateUrl: './proposal-detail-dialog.component.html',
  styleUrls: ['./proposal-detail-dialog.component.css']
})
export class ProposalDetailDialogComponent {
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

  rejectProposal(): void{
    this.updateProposalStatus('Rejected');
  }

  private updateProposalStatus(status: string): void{
    const payload = {
      proposal_id: this.data.id,
      status
    }

    this.dialogRef.close({ updated: true, status });

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
