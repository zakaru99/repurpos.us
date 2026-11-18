import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { LoginStateService, StructureService } from '../_services/index';

@Component({
  selector: 'app-compound-search',
  templateUrl: './compound-search.component.html',
  styleUrls: ['./compound-search.component.scss']
})
export class CompoundSearchComponent implements OnDestroy {
  isIE: boolean;
  // For the results placeholder: shown on the name search until a search is made
  structureTab = false;
  hasQuery = false;

  private sub: Subscription;

  constructor(
    route: ActivatedRoute,
    private structSvc: StructureService,
    private loginState: LoginStateService
  ) {
    let ua = window.navigator.userAgent;
    let msie = ua.indexOf('MSIE ');
    this.isIE = msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);

    this.sub = route.queryParams.subscribe(params => {
      this.structureTab = params.type === 'structure' || params.type === 'substructure';
      this.hasQuery = !!params.query;
    });
  }

  // Substructure needs an account: signed out, the editor hides and this
  // message shows as soon as it's chosen; the search waits for sign-in
  get substructureWalled(): boolean {
    return this.structureTab && this.structSvc.currentMode === 'substructure' && !this.loginState.hasSession();
  }

  signIn() {
    window.dispatchEvent(new CustomEvent('reframe-sign-in'));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
