import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Role, roleOf } from '../../_models/index';
import { LoginStateService } from '../../_services/index';

interface User {
  id: number;
  email: string;
  role: Role;
  registered_on?: string;
}

// The backend sends `role` (and `admin` for older clients)
const toUser = (u: any): User => ({ id: u.id, email: u.email, role: roleOf(u), registered_on: u.registered_on });

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  searchQuery: string = '';
  searchResults: User[] = [];
  // Everyone with portal access: admins, reviewers and read-only staff
  staff: User[] = [];
  errorMsg: string = '';

  // The backend refuses changes to your own access
  private myEmail: string = null;

  constructor(private http: HttpClient, private loginState: LoginStateService) { }

  ngOnInit(): void {
    this.myEmail = this.loginState.getUserEmail();
    this.loadStaff();
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders().set('Authorization', localStorage.getItem('auth_token') || '');
  }

  isMe(user: User): boolean {
    return !!this.myEmail && user.email.toLowerCase() === this.myEmail.toLowerCase();
  }

  roleName(role: Role): string {
    return { admin: 'Admin', reviewer: 'Reviewer', readonly: 'Read-only', user: 'User' }[role];
  }

  loadStaff(): void {
    const params = new HttpParams().set('admins', 'true');
    this.http.get<{ success: boolean; data: any[] }>('/api/users', { params, headers: this.headers })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.staff = res.data.map(toUser);
          } else {
            this.errorMsg = 'Failed to load who has access';
          }
        },
        error: () => this.errorMsg = 'Error loading who has access'
      });
  }

  searchUser(): void {
    const term = this.searchQuery.trim();
    if (!term) {
      this.searchResults = [];
      return;
    }

    const params = new HttpParams().set('search', term);
    this.http.get<{ success: boolean; data: any[] }>('/api/users', { params, headers: this.headers })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.searchResults = res.data.map(toUser);
          } else {
            this.errorMsg = 'Search failed';
          }
        },
        error: () => this.errorMsg = 'Error during search'
      });
  }

  // 'user' removes portal access
  setRole(user: User, role: Role): void {
    const question = role === 'user' ? `Remove ${user.role} access for ${user.email}?`
      : role === 'admin' ? `Make ${user.email} an admin? Admins can also manage access and maintenance.`
      : role === 'reviewer' ? `Make ${user.email} a reviewer? Reviewers can approve and decline proposals.`
      : `Make ${user.email} read-only? They can read proposals but not decide them.`;
    if (!window.confirm(question)) {
      return;
    }

    this.errorMsg = '';
    this.http.post<{ success: boolean; message: string; error?: string }>('/api/users', {
      user_id: user.id,
      role
    }, { headers: this.headers }).subscribe({
      next: (res) => {
        if (res.success) {
          const found = this.searchResults.find(u => u.id === user.id);
          if (found) { found.role = role; }
          this.loadStaff();
        } else {
          this.errorMsg = res.error || 'Could not change access';
        }
      },
      error: (err) => this.errorMsg = (err.error && err.error.error) || 'Could not change access'
    });
  }

}
