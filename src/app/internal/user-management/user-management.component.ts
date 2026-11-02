import { Component, OnInit } from '@angular/core';

import { Role } from '../../_models';
import { LoginStateService } from '../../_services';
import { AdminApiService, AdminUser } from '../admin-api.service';

// Who can use the admin portal, and user lookup. Reviewers can decide
// proposals; admins can also manage access and maintenance. Every change asks
// for confirmation in place, and errors are shown on the page.
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  searchQuery = '';
  searchResults: AdminUser[] = null;   // null = no search run yet
  searching = false;
  staff: AdminUser[] = [];
  loadingStaff = false;
  errorMsg = '';

  // The user whose access change is awaiting confirmation, and the role they'd get
  confirmUser: AdminUser = null;
  confirmRole: Role = null;
  saving = false;

  // The backend refuses changes to your own access
  private myEmail: string = null;

  constructor(private api: AdminApiService, private loginState: LoginStateService) { }

  ngOnInit(): void {
    this.myEmail = this.loginState.getUserEmail();
    this.loadStaff();
  }

  get admins(): AdminUser[] {
    return this.staff.filter(u => u.role === 'admin');
  }

  get reviewers(): AdminUser[] {
    return this.staff.filter(u => u.role === 'reviewer');
  }

  // "2 admins and 3 reviewers"
  get headline(): string {
    const n = (count: number, one: string) => count + ' ' + one + (count === 1 ? '' : 's');
    if (!this.reviewers.length) { return n(this.admins.length, 'admin'); }
    return n(this.admins.length, 'admin') + ' and ' + n(this.reviewers.length, 'reviewer');
  }

  isMe(u: AdminUser): boolean {
    return !!this.myEmail && u.email.toLowerCase() === this.myEmail.toLowerCase();
  }

  roleName(role: Role): string {
    return { admin: 'Admin', reviewer: 'Reviewer', user: 'No access' }[role];
  }

  loadStaff(): void {
    this.loadingStaff = true;
    this.api.getStaff().subscribe({
      next: list => {
        this.staff = list;
        this.loadingStaff = false;
      },
      error: () => {
        this.errorMsg = 'Could not load who has access.';
        this.loadingStaff = false;
      }
    });
  }

  searchUser(): void {
    const term = this.searchQuery.trim();
    if (!term) {
      this.searchResults = null;
      return;
    }
    this.searching = true;
    this.errorMsg = '';
    this.api.searchUsers(term).subscribe({
      next: list => {
        this.searchResults = list;
        this.searching = false;
      },
      error: () => {
        this.errorMsg = 'Search failed. Please try again.';
        this.searching = false;
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = null;
  }

  // Accounts don't store names yet. Use one if the backend sends it; otherwise
  // read "first.last@..." emails as a name; null means show the email alone.
  displayName(u: AdminUser): string {
    if (u.name) { return u.name; }
    const local = (u.email || '').split('@')[0];
    const parts = local.split(/[._-]+/).filter(p => /^[a-z]{2,}$/i.test(p));
    if (parts.length >= 2) {
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
    return null;
  }

  initials(u: AdminUser): string {
    const name = this.displayName(u);
    const source = name ? name.split(' ') : [(u.email || '?').charAt(0)];
    return source.slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('');
  }

  ask(user: AdminUser, role: Role) {
    this.confirmUser = user;
    this.confirmRole = role;
  }

  cancelConfirm() {
    this.confirmUser = null;
    this.confirmRole = null;
  }

  isConfirming(user: AdminUser, role?: Role): boolean {
    return !!this.confirmUser && this.confirmUser.id === user.id && (!role || this.confirmRole === role);
  }

  confirmChange(): void {
    const user = this.confirmUser;
    const role = this.confirmRole;
    if (!user || !role) { return; }
    this.saving = true;
    this.errorMsg = '';
    this.api.setRole(user.id, role).subscribe({
      next: () => {
        this.saving = false;
        this.cancelConfirm();
        // Only update the page once the server has made the change
        const found = (this.searchResults || []).find(u => u.id === user.id);
        if (found) {
          found.role = role;
          found.isAdmin = role === 'admin';
        }
        this.loadStaff();
      },
      error: () => {
        this.saving = false;
        this.errorMsg = role === 'user'
          ? 'Could not remove access for ' + user.email + '.'
          : 'Could not make ' + user.email + ' ' + (role === 'admin' ? 'an admin.' : 'a reviewer.');
      }
    });
  }
}
