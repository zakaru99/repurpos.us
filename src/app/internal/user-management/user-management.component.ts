import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

import { Role } from '../../_models';
import { LoginStateService } from '../../_services';
import { AdminApiService, AdminUser } from '../admin-api.service';

// Who can use the admin portal, and user lookup. Read-only staff can read
// proposals; reviewers can also decide them; admins can also manage access
// and maintenance. Each person's role is a pop-up menu; a pick asks for
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
  staff: AdminUser[] = [];
  // The role menu's options, least access first
  roleOptions: Role[] = ['readonly', 'reviewer', 'admin'];
  // The user whose role menu is open
  menuFor: AdminUser = null;
  loadingStaff = false;
  errorMsg = '';

  // The user whose access change is awaiting confirmation, and the role they'd get
  confirmUser: AdminUser = null;
  confirmRole: Role = null;
  saving = false;

  // The backend refuses changes to your own access
  private myEmail: string = null;

  constructor(private api: AdminApiService, private loginState: LoginStateService, private host: ElementRef) { }

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

  get readonly(): AdminUser[] {
    return this.staff.filter(u => u.role === 'readonly');
  }

  // "2 admins, 3 reviewers and 1 read-only"
  get headline(): string {
    const n = (count: number, one: string, many = one + 's') => count + ' ' + (count === 1 ? one : many);
    const parts = [n(this.admins.length, 'admin')];
    if (this.reviewers.length) { parts.push(n(this.reviewers.length, 'reviewer')); }
    if (this.readonly.length) { parts.push(n(this.readonly.length, 'read-only', 'read-only')); }
    return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
  }

  isMe(u: AdminUser): boolean {
    return !!this.myEmail && u.email.toLowerCase() === this.myEmail.toLowerCase();
  }

  roleName(role: Role): string {
    return { admin: 'Admin', reviewer: 'Reviewer', readonly: 'Read-only', user: 'No access' }[role];
  }

  roleNote(role: Role): string {
    return {
      readonly: 'Can read proposals',
      reviewer: 'Can also approve and decline them',
      admin: 'Can also manage access and maintenance'
    }[role];
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

  isMenuOpen(u: AdminUser): boolean {
    return !!this.menuFor && this.menuFor.id === u.id;
  }

  toggleMenu(u: AdminUser, event: Event) {
    event.stopPropagation();
    if (this.isMenuOpen(u)) {
      this.closeMenu();
      return;
    }
    this.menuFor = u;
    // Focus the checked item, as a native pop-up menu does
    setTimeout(() => this.focusMenuItem(0, true));
  }

  closeMenu(returnFocus = false) {
    const id = this.menuFor && this.menuFor.id;
    this.menuFor = null;
    if (returnFocus && id != null) {
      setTimeout(() => {
        const button = this.host.nativeElement.querySelector('[data-role-button="' + id + '"]');
        if (button) { button.focus(); }
      });
    }
  }

  // Picking their current role just closes the menu
  pick(u: AdminUser, role: Role) {
    this.closeMenu(true);
    if (role !== u.role) {
      this.ask(u, role);
    }
  }

  // Up and Down move through the menu, Escape closes it
  onMenuKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeMenu(true);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusMenuItem(event.key === 'ArrowDown' ? 1 : -1);
    }
  }

  private focusMenuItem(step: number, checked = false) {
    const items: HTMLElement[] = Array.from(this.host.nativeElement.querySelectorAll('.role-menu [role^="menuitem"]'));
    if (!items.length) { return; }
    let i = items.indexOf(document.activeElement as HTMLElement);
    if (checked) {
      i = Math.max(0, items.findIndex(el => el.getAttribute('aria-checked') === 'true'));
    } else {
      i = (i + step + items.length) % items.length;
    }
    items[i].focus();
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuFor) { this.closeMenu(); }
  }

  confirmText(u: AdminUser): string {
    switch (this.confirmRole) {
      case 'user':
        return 'Remove ' + this.roleName(u.role).toLowerCase() + ' access?';
      case 'admin':
        return (u.role === 'user' ? 'Give admin access?' : 'Make admin?') + ' They can also manage access and maintenance.';
      case 'reviewer':
        return u.role === 'admin' ? 'Change to reviewer? They\'ll lose access and maintenance.'
          : 'Give reviewer access? They can approve and decline proposals.';
      case 'readonly':
        return u.role === 'user' ? 'Give read-only access? They can read proposals but not decide them.'
          : 'Change to read-only? They\'ll only be able to read proposals.';
    }
  }

  confirmLabel(u: AdminUser): string {
    if (this.confirmRole === 'user') { return 'Remove'; }
    return u.role === 'user' ? 'Give access' : 'Change role';
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
          : 'Could not make ' + user.email + ' ' + { admin: 'an admin.', reviewer: 'a reviewer.', readonly: 'read-only.' }[role];
      }
    });
  }
}
