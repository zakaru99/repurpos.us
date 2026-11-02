import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoginStateService } from '../../_services/index';

@Component({
  selector: 'app-internal-layout',
  templateUrl: './internal-layout.component.html',
  styleUrls: ['./internal-layout.component.scss']
})
export class InternalLayoutComponent implements OnInit, OnDestroy {
  // Reviewers don't see User Management and Maintenance
  isAdmin = false;
  private loginSub: Subscription;

  constructor(private loginState: LoginStateService) { }

  ngOnInit() {
    this.loginSub = this.loginState.isUserLoggedIn.subscribe(state => this.isAdmin = state.role === 'admin');
  }

  ngOnDestroy() {
    if (this.loginSub) { this.loginSub.unsubscribe(); }
  }

}
