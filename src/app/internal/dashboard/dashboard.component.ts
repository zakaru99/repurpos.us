import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MaintenanceWindow } from '../../_models';
import { formatPacificDisplay } from '../../_services';
import { AdminApiService, AdminProposal } from '../admin-api.service';

const submittedTime = (p: { submittedOn?: string }): number =>
  p.submittedOn ? new Date(p.submittedOn).getTime() : 0;

// Admin overview: leads with what needs a decision. Each source loads
// independently so one failing endpoint doesn't blank the page.
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;

  proposals: AdminProposal[] = null;
  windows: MaintenanceWindow[] = null;

  constructor(private api: AdminApiService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    forkJoin(
      this.api.getProposals().pipe(catchError(() => of(null))),
      this.api.getMaintenanceWindows().pipe(catchError(() => of(null)))
    ).subscribe(([proposals, windows]) => {
      this.proposals = proposals;
      this.windows = windows;
      this.loading = false;
    });
  }

  count(status: string): number {
    return (this.proposals || []).filter(p => p.status === status).length;
  }

  // Oldest first: the ones that have waited longest come first
  get waiting(): AdminProposal[] {
    return (this.proposals || [])
      .filter(p => p.status === 'Pending')
      .sort((a, b) => submittedTime(a) - submittedTime(b));
  }

  open(p: AdminProposal) {
    this.router.navigate(['../proposals'], { relativeTo: this.route, queryParams: { id: p.id } });
  }

  // Newest submissions, any status, for the right-hand column
  get latest(): AdminProposal[] {
    return (this.proposals || []).slice()
      .sort((a, b) => submittedTime(b) - submittedTime(a))
      .slice(0, 5);
  }


  get nextWindow(): MaintenanceWindow {
    const now = Date.now();
    return (this.windows || [])
      .filter(w => w.scheduledStart && new Date(w.scheduledStart).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())[0] || null;
  }

  formatPacific(iso: string): string {
    return iso ? formatPacificDisplay(iso) : '—';
  }
}
