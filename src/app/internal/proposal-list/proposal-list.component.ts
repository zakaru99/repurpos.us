import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminApiService, AdminProposal, ProposalStatus } from '../admin-api.service';

type StatusFilter = '' | ProposalStatus;

const submittedTime = (p: { submittedOn?: string }): number =>
  p.submittedOn ? new Date(p.submittedOn).getTime() : 0;

// Proposals: list on the left, the selected proposal on the right. The
// selection is kept in the URL (?id=) so the overview can link to one.
@Component({
  selector: 'app-proposal-list',
  templateUrl: './proposal-list.component.html',
  styleUrls: ['./proposal-list.component.scss']
})
export class ProposalListComponent implements OnInit {
  proposals: AdminProposal[] = [];
  isLoading = false;
  errorMessage = '';

  selectedStatus: StatusFilter = '';
  query = '';
  selectedId: number = null;

  readonly filters: Array<{ value: StatusFilter; label: string }> = [
    { value: '', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  constructor(private api: AdminApiService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const id = parseInt(params.get('id'), 10);
    if (!isNaN(id)) { this.selectedId = id; }
    const status = params.get('status') as StatusFilter;
    if (status && this.filters.some(f => f.value === status)) { this.selectedStatus = status; }
    this.fetchProposals();
  }

  fetchProposals(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getProposals().subscribe({
      next: list => {
        // Newest first
        this.proposals = list.slice().sort((a, b) =>
          submittedTime(b) - submittedTime(a));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load proposals.';
        this.isLoading = false;
      }
    });
  }

  count(status: StatusFilter): number {
    return status ? this.proposals.filter(p => p.status === status).length : this.proposals.length;
  }

  get filteredProposals(): AdminProposal[] {
    const q = this.query.trim().toLowerCase();
    return this.proposals.filter(p =>
      (!this.selectedStatus || p.status === this.selectedStatus) &&
      (!q || [p.indication, p.submittedBy, p.institution, p.email, String(p.id)]
        .some(v => (v || '').toLowerCase().includes(q))));
  }

  get selected(): AdminProposal {
    return this.proposals.find(p => p.id === this.selectedId) || null;
  }

  filterByStatus(status: StatusFilter) {
    this.selectedStatus = status;
    this.syncUrl();
  }

  select(p: AdminProposal) {
    this.selectedId = p.id;
    this.syncUrl();
  }

  clearSelection() {
    this.selectedId = null;
    this.syncUrl();
  }

  onStatusChanged(change: { id: number; status: ProposalStatus; reason?: string }) {
    const p = this.proposals.find(x => x.id === change.id);
    if (p) {
      p.status = change.status;
      if (change.reason) { p.denialReason = change.reason; }
    }
  }

  private syncUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: this.selectedId, status: this.selectedStatus || null },
      replaceUrl: true
    });
  }
}
