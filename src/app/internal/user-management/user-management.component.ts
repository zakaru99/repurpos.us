import { Component, OnInit } from '@angular/core';

import { AdminApiService, AdminUser } from '../admin-api.service';

// Admins and user lookup. Granting or revoking admin access asks for
// confirmation in place, and errors are shown on the page.
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  searchQuery = '';
  searchResults: AdminUser[] = null;   // null = no search run yet
  searching = false;
  admins: AdminUser[] = [];
  loadingAdmins = false;
  errorMsg = '';

  // The user whose access change is awaiting confirmation, and which change
  confirmUser: AdminUser = null;
  confirmGrant = false;
  saving = false;

  constructor(private api: AdminApiService) { }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loadingAdmins = true;
    this.api.getAdmins().subscribe({
      next: list => {
        this.admins = list;
        this.loadingAdmins = false;
      },
      error: () => {
        this.errorMsg = 'Could not load the admin list.';
        this.loadingAdmins = false;
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

  askToGrant(user: AdminUser) {
    this.confirmUser = user;
    this.confirmGrant = true;
  }

  askToRevoke(user: AdminUser) {
    this.confirmUser = user;
    this.confirmGrant = false;
  }

  cancelConfirm() {
    this.confirmUser = null;
  }

  isConfirming(user: AdminUser, grant: boolean): boolean {
    return !!this.confirmUser && this.confirmUser.id === user.id && this.confirmGrant === grant;
  }

  confirmChange(): void {
    const user = this.confirmUser;
    const grant = this.confirmGrant;
    if (!user) { return; }
    this.saving = true;
    this.errorMsg = '';
    this.api.setAdmin(user.id, grant).subscribe({
      next: () => {
        this.saving = false;
        this.confirmUser = null;
        user.isAdmin = grant;
        if (grant) {
          this.loadAdmins();
        } else {
          this.admins = this.admins.filter(u => u.id !== user.id);
        }
        const found = (this.searchResults || []).find(u => u.id === user.id);
        if (found) { found.isAdmin = grant; }
      },
      error: () => {
        this.saving = false;
        this.errorMsg = grant ? 'Could not grant admin access.' : 'Could not revoke admin access.';
      }
    });
  }
}
