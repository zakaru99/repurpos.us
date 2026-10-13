import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
  private sub: Subscription;

  constructor(private api: AdminApiService, private router: Router) { }

  ngOnInit() {
    this.refresh();
    this.sub = this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }

  private refresh() {
    this.api.pendingCount().subscribe(n => this.pending = n);
  }
}
