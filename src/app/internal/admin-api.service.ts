import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { MaintenanceWindow, Role, roleOf } from '../_models';

export type ProposalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AdminProposal {
  id: number;
  indication: string;
  submittedBy: string;
  email?: string;
  institution?: string;
  status: ProposalStatus | string;
  submittedOn?: string;
  description: string;
  notes: string;
  volume?: number;
  concentration?: number;
  denialReason: string;
}

export interface AdminUser {
  id: number;
  email: string;
  role: Role;
  isAdmin: boolean;
  name?: string;          // not stored by the backend yet; used if it starts sending one
  registered_on?: string;
}

// The backend sends `role` and `admin`; the portal uses `role` and `isAdmin`
const toUser = (u: any): AdminUser => ({
  id: u.id,
  email: u.email,
  role: roleOf(u),
  isAdmin: roleOf(u) === 'admin',
  name: u.name || undefined,
  registered_on: u.registered_on
});

// Calls used by the admin portal, in one place. Request shapes are unchanged
// from the original per-component code.
@Injectable({ providedIn: 'root' })
export class AdminApiService {

  constructor(private http: HttpClient) { }

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', localStorage.getItem('auth_token') || '');
  }

  // ---------------------------------------------------------------- proposals

  getProposals(): Observable<AdminProposal[]> {
    return this.http.get<{ success: boolean; data: any[] }>('/api/assay_proposal', { headers: this.authHeaders }).pipe(
      map(res => (res && res.success ? res.data : []).map(p => ({
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
        concentration: p.concentration,
        denialReason: p.denialReason || ''
      })))
    );
  }

  updateProposalStatus(id: number, status: ProposalStatus, reason?: string): Observable<any> {
    const payload: any = { proposal_id: id, status };
    if (reason && reason.trim()) {
      payload.denial_reason = reason.trim();
    }
    return this.http.post('/api/update_proposal_status', payload, { headers: this.authHeaders });
  }

  // ---------------------------------------------------------------- users

  // Everyone with portal access: admins and reviewers
  getStaff(): Observable<AdminUser[]> {
    const params = new HttpParams().set('admins', 'true');
    return this.http.get<{ success: boolean; data: AdminUser[] }>('/api/users', { params, headers: this.authHeaders }).pipe(
      map(res => {
        if (!res.success) { throw new Error('Failed to load the access list'); }
        return res.data.map(toUser);
      })
    );
  }

  searchUsers(term: string): Observable<AdminUser[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<{ success: boolean; data: AdminUser[] }>('/api/users', { params, headers: this.authHeaders }).pipe(
      map(res => {
        if (!res.success) { throw new Error('Search failed'); }
        return res.data.map(toUser);
      })
    );
  }

  // 'user' removes portal access
  setRole(userId: number, role: Role): Observable<void> {
    return this.http.post<{ success: boolean; message: string; error?: string }>('/api/users',
      { user_id: userId, role }, { headers: this.authHeaders }).pipe(
      map(res => {
        if (!res.success) { throw new Error(res.error || res.message || 'Update failed'); }
      })
    );
  }

  // ---------------------------------------------------------------- maintenance

  getMaintenanceWindows(): Observable<MaintenanceWindow[]> {
    return this.http.get<{ status: string; data: MaintenanceWindow[] }>('/api/maintenance_window/list',
      { headers: this.authHeaders }).pipe(map(res => res.data || []));
  }

  saveMaintenanceWindow(id: number | null, payload: any): Observable<any> {
    return id
      ? this.http.put(`/api/maintenance_window/${id}`, payload, { headers: this.authHeaders })
      : this.http.post('/api/maintenance_window', payload, { headers: this.authHeaders });
  }

  deleteMaintenanceWindow(id: number): Observable<any> {
    return this.http.delete(`/api/maintenance_window/${id}`, { headers: this.authHeaders });
  }

  // Count of pending proposals for the toolbar badge; 0 on failure
  pendingCount(): Observable<number> {
    return this.getProposals().pipe(
      map(list => list.filter(p => p.status === 'Pending').length),
      catchError(() => of(0))
    );
  }
}
