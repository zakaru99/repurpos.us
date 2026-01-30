import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ProposalDetailDialogComponent } from '../proposal-detail-dialog/proposal-detail-dialog.component';

interface Proposal {
  id: number;
  indication?: string;
  name?: string;
  email?: string;
  institution?: string;
  status?: string;
  submittedOn?: string;
  description?: string;
  notes?: string;
  volume?: number;
  concentration?: number;
}



@Component({
  selector: 'app-proposal-list',
  templateUrl: './proposal-list.component.html',
  styleUrls: ['./proposal-list.component.css']
})
export class ProposalListComponent implements OnInit {

  proposals: Proposal[] = [];
  isLoading = false;
  errorMessage = '';
  selectedStatus: string = '';


  constructor(private http: HttpClient, private dialog: MatDialog) {}

  get filteredProposals() {
    if (!this.selectedStatus) return this.proposals;
    return this.proposals.filter(p => p.status === this.selectedStatus);
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
  }

  fetchProposals(): void {
    this.isLoading = true;

    this.http.get<{ success: boolean; data: Proposal[] }>('/api/assay_proposal')
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log(response.data);
            this.proposals = response.data.map(p => ({
              id: p.id,
              indication: p.indication || '',
              submittedBy: p.name,
              email: p.email,
              institution: p.institution,
              status: p.status,
              submittedOn: p.submittedOn,
              description: p.description || '',
              notes: p.notes || '',
              volume: p.volume,
              concentration: p.concentration
            }));



          }
          this.isLoading = false;
        },
        // error: (err) => {
        //   this.errorMessage = err.error?.message || 'Failed to fetch proposals.';
        //   this.isLoading = false;
        // }
      });
  }

viewProposal(proposal: Proposal): void {
  const dialogRef = this.dialog.open(ProposalDetailDialogComponent, {
    data: proposal,
    width: '600px',
    panelClass: 'proposal-dialog'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && result.updated) {
      // Find the proposal in the list and update the status
      const index = this.proposals.findIndex(p => p.id === proposal.id);
      if (index !== -1) {
        this.proposals[index].status = result.status;
      }
    }
  });
}

  ngOnInit(): void {
    this.fetchProposals();
  }
}
