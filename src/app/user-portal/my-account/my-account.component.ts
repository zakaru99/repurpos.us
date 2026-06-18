import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginStateService } from '../../_services';

interface UserStatus {
  user_id: number;
  email: string;
  admin: boolean;
  registered_on: string;
}

interface AssaySummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  userStatus: UserStatus | null = null;
  assaySummary: AssaySummary | null = null;
  resetState: 'idle' | 'loading' | 'sent' = 'idle';
  deleteState: 'idle' | 'confirming' | 'loading' | 'unavailable' = 'idle';
  deleteConfirmEmail = '';

  constructor(private http: HttpClient, private loginState: LoginStateService) {}

  ngOnInit(): void {
    this.loginState.isUserLoggedIn.subscribe(state => {
      if (state.loggedIn && state.email) {
        this.loadProfile();
        this.loadAssaySummary(state.email);
      }
    });
  }

  get canConfirmDelete(): boolean {
    return this.userStatus !== null && this.deleteConfirmEmail === this.userStatus.email;
  }

  resetPassword(): void {
    if (!this.userStatus || !this.userStatus.email || this.resetState !== 'idle') { return; }
    this.resetState = 'loading';
    this.http.post('/api/auth/reset_pass/link', {
      email: this.userStatus.email,
      app: 'reframedb'
    }).subscribe({
      next:  () => { this.resetState = 'sent'; },
      error: () => { this.resetState = 'sent'; }
    });
  }

  startDelete(): void {
    this.deleteState = 'confirming';
    this.deleteConfirmEmail = '';
  }

  cancelDelete(): void {
    this.deleteState = 'idle';
    this.deleteConfirmEmail = '';
  }

  confirmDelete(): void {
    if (!this.canConfirmDelete) { return; }
    this.deleteState = 'unavailable';
  }

  private loadProfile(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) { return; }
    this.http.get<{ status: string; data: UserStatus }>(
      '/api/auth/status',
      { headers: new HttpHeaders().set('Authorization', token) }
    ).subscribe({
      next: (res) => { this.userStatus = res.data; },
      error: () => {}
    });
  }

  private loadAssaySummary(email: string): void {
    this.http.get<{ success: boolean; data: any[] }>(`/api/assay_proposal?email=${email}`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            const d = res.data;
            this.assaySummary = {
              total:    d.length,
              approved: d.filter(a => a.status === 'Approved').length,
              pending:  d.filter(a => a.status === 'Pending').length,
              rejected: d.filter(a => a.status === 'Rejected').length
            };
          }
        },
        error: () => {}
      });
  }
}
