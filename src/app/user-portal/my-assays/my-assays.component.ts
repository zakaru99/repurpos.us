import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { LoginStateService } from '../../_services';

type Status = 'Pending' | 'Approved' | 'Rejected';

interface Assay {
  id: number;
  indication: string;
  status: Status;
  submittedOn?: string | Date | null;
  institution?: string;
  description?: string;
  notes?: string;
  denialReason?: string;
  volume?: number;
  concentration?: number;
}

// The signed-in user's assay proposals: loaded once, filtered here so each
// filter can show its count. A row opens in place to show what was submitted.
@Component({
  selector: 'app-my-assays',
  templateUrl: './my-assays.component.html',
  styleUrls: ['./my-assays.component.scss']
})
export class MyAssaysComponent implements OnInit, OnDestroy {
  assays: Assay[] = [];
  selectedStatus: '' | Status = '';
  openId: number | null = null;
  loading = false;
  failed = false;

  readonly filters: Array<{ label: string; value: '' | Status }> = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  private sub: Subscription;

  constructor(private http: HttpClient, private loginState: LoginStateService) { }

  ngOnInit(): void {
    this.sub = this.loginState.isUserLoggedIn.subscribe(state => {
      if (state.loggedIn && state.email) {
        this.loadAssays(state.email);
      } else {
        this.assays = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
  }

  get filtered(): Assay[] {
    return this.selectedStatus ? this.assays.filter(a => a.status === this.selectedStatus) : this.assays;
  }

  count(status: '' | Status): number {
    return status ? this.assays.filter(a => a.status === status).length : this.assays.length;
  }

  loadAssays(userEmail: string): void {
    this.loading = true;
    this.failed = false;
    const params = new HttpParams().set('email', userEmail);
    this.http.get<{ success: boolean; data: Assay[] }>('/api/assay_proposal', { params })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.assays = res.success
            ? res.data
                .map(a => ({ ...a, submittedOn: a.submittedOn ? new Date(String(a.submittedOn)) : null }))
                .sort((x, y) => +(y.submittedOn || 0) - +(x.submittedOn || 0))
            : [];
        },
        error: () => {
          this.loading = false;
          this.failed = true;
          this.assays = [];
        }
      });
  }

  reload(): void {
    const email = this.loginState.getUserEmail();
    if (email) { this.loadAssays(email); }
  }

  filterByStatus(status: '' | Status): void {
    this.selectedStatus = status;
    this.openId = null;
  }

  toggle(assay: Assay): void {
    this.openId = this.openId === assay.id ? null : assay.id;
  }
}
