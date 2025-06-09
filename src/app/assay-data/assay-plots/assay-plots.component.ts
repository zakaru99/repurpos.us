import { Component, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';

import { LoginState } from '../../_models/index';
import { LoginStateService, AssayDataService } from '../../_services/index';
import { AssayPaginationComponent } from '../assay-pagination/assay-pagination.component'

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
  }

  getDownloadUrl(){
    if (this.aid === 'A00635') {
      return "../../../assets/assay_one_offs/A00635_TP Reframe Dose response.xlsx";
    } else if (this.aid === 'A00434') {
      return "../../../assets/assay_one_offs/A00434.zip";
    }
    // Add more conditions as needed
    return ""; // Default or empty if no match
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

}