import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LoginStateService } from '../../_services';

// User portal shell: the same thin navy band as the admin portal, with the
// signed-in email on the right.
@Component({
  selector: 'app-user-portal-layout',
  templateUrl: './user-portal-layout.component.html',
  styleUrls: ['./user-portal-layout.component.scss']
})
export class UserPortalLayoutComponent implements OnInit, OnDestroy {
  loggedIn = false;
  email: string | null = null;
  private subs: Subscription[] = [];

  constructor(private loginState: LoginStateService, private router: Router) { }

  // PREVIEW: the sample screen page works without signing in
  isPreview(): boolean {
    return this.router.url.indexOf('/user_portal/screens') === 0;
  }

  ngOnInit() {
    this.subs.push(
      this.loginState.isUserLoggedIn.subscribe(state => {
        // The state starts logged-out until the auth check returns; a stored
        // token means that check is still on its way, so don't flash "sign in"
        this.loggedIn = !!state.loggedIn || this.hasToken();
        this.email = state.loggedIn ? state.email : null;
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private hasToken(): boolean {
    try {
      return !!localStorage.getItem('auth_token');
    } catch (e) {
      return false;
    }
  }
}
