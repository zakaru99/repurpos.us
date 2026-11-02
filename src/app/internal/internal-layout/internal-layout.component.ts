import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LoginStateService } from '../../_services/index';
import { AdminApiService } from '../admin-api.service';

@Component({
  selector: 'app-internal-layout',
  templateUrl: './internal-layout.component.html',
  styleUrls: ['./internal-layout.component.scss']
})
export class InternalLayoutComponent implements OnInit, OnDestroy {
  // Pending proposals, shown on the Proposals tab; refreshed on each navigation
  // so it reflects approvals/rejections made on other tabs
  pending = 0;
  // Reviewers don't see the Access and Maintenance tabs
  isAdmin = false;
  private sub: Subscription;
  private loginSub: Subscription;

  constructor(private api: AdminApiService, private router: Router, private loginState: LoginStateService) { }

  ngOnInit() {
    this.loginSub = this.loginState.isUserLoggedIn.subscribe(state => this.isAdmin = state.role === 'admin');
    this.refresh();
    this.sub = this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
    if (this.loginSub) { this.loginSub.unsubscribe(); }
  }

  private refresh() {
    this.api.pendingCount().subscribe(n => this.pending = n);
  }
}
