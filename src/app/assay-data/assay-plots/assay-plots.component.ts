import { Component, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';

import { LoginStateService, AssayDataService } from '../../_services/index';

@Component({
  selector: 'app-assay-plots',
  templateUrl: './assay-plots.component.html',
  styleUrls: ['./assay-plots.component.scss']
})

export class AssayPlotsComponent implements OnDestroy {
  @Input() assay_title: string;
  @Input() aid: string;
  public loggedIn: boolean;

  private loginSubscription: Subscription;
  public hasDoseResponseData = true;
  public state = 'idle';
  private dataSubscription: Subscription;
  private stateSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private dataSvc: AssayDataService,
    private loginStateService: LoginStateService
  ) {
    this.loginSubscription =
      combineLatest(loginStateService.isUserLoggedIn, route.params).subscribe(([login, params]) => {
        if (login.loggedIn === true && params['aid']) {
          this.loggedIn = true;
          this.aid = params['aid'];
          this.dataSvc.retrieveAssayData(this.aid);
        }
      })

      this.dataSubscription = this.dataSvc.flatAssayDataSource.subscribe(data => {
        this.hasDoseResponseData = !!data && data.length > 0;
      });

      this.stateSubscription = this.dataSvc.loadState$.subscribe(s => this.state = s);
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
    this.stateSubscription.unsubscribe();
  }

}