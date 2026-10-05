import { Component, Inject, Injectable, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Subscription } from 'rxjs/Subscription';

import { CompoundSearchComponent } from '../compound-search/compound-search.component'
import { CompoundDataComponent } from "../compound-data/compound-data.component";
import { AboutComponent } from "../about/about.component";
import { AssaysComponent } from "../assays/assays.component";
import { AssayDataComponent } from "../assay-data/assay-data.component";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { isDefined } from "@angular/compiler/src/util";
import { environment } from "../../environments/environment";
import { LoginStateService } from '../_services/index';
import { LoginState, RouteDef } from '../_models/index';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {

  routeDef: RouteDef[];
  loginBox: boolean = false;
  loggedIn: boolean = false;
  isAdmin: boolean = false;
  expanded: boolean = false;
  isMobile: boolean;
  current_year: number;
  private loginSubscription: Subscription;
  // Typed any: this TS/lib version predates ResizeObserver's ambient type
  // declarations (unlike the older IntersectionObserver, used elsewhere).
  private resizeObserver: any;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private http: HttpClient,
    private loginStateService: LoginStateService,
    private elementRef: ElementRef
  ) {
    this.checkMobile();
  }

  // Publishes this (sticky) header's real rendered height as a CSS custom
  // property, so other sticky elements further down the page (e.g. the
  // compound-detail page's own sticky header/sidebar) can position
  // themselves against the actual value instead of a hardcoded guess.
  // Driven by a ResizeObserver (see ngAfterViewInit) rather than a pile of
  // manually-guessed re-measurement triggers (font load, login-state
  // change, window resize) - those fired independently and could race each
  // other, publishing stale/inconsistent values. ResizeObserver fires once,
  // correctly, for any actual size change regardless of cause.
  private publishHeaderHeight(): void {
    const height = this.elementRef.nativeElement.offsetHeight;
    this.document.documentElement.style.setProperty('--site-header-height', height + 'px');
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new (window as any).ResizeObserver(() => this.publishHeaderHeight());
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.loginSubscription = this.loginStateService.isUserLoggedIn
      .subscribe((state: LoginState) => {
        this.loggedIn = state.loggedIn;
        this.isAdmin = state.isAdmin;
        this.loginBox = false;
        this.expanded = false;
      });
  }

  showLogin() {
    this.loginBox = !this.loginBox;
  }

  clickedInside($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  toggleNav() {
    this.expanded = !this.expanded;
    if (!this.expanded) {
      this.loginBox = false;
    }
  }

  collapseNav() {
    this.expanded = false;
  }

  checkMobile() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  @HostListener('window:resize') onResize() {
    this.checkMobile();
  }

  @HostListener('document:click', ['$event']) clickedOutside($event) {
    if (this.loginBox) {
      this.loginBox = false;
    }
  }
}
