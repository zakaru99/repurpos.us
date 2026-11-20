import { Component, Inject, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { LoginStateService } from '../_services/index';
import { LoginState, hasPortal } from '../_models/index';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {

  loginBox: boolean = false;
  loggedIn: boolean = false;
  // Admins, reviewers and read-only staff get the admin portal link
  hasPortal: boolean = false;
  // Phone/tablet menu. Open, it covers the page, so the page behind it
  // mustn't scroll (body.menu-open, styles.scss)
  private _expanded = false;
  get expanded(): boolean { return this._expanded; }
  set expanded(open: boolean) {
    this._expanded = open;
    document.body.classList.toggle('menu-open', open);
  }
  isMobile: boolean;
  inAdmin = false;
  private loginSubscription: Subscription;
  private routerSubscription: Subscription;
  // Typed any: this TS/lib version predates ResizeObserver's type declarations
  private resizeObserver: any;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private loginStateService: LoginStateService,
    private elementRef: ElementRef,
    private router: Router
  ) {
    this.checkMobile();

    // Close the phone menu after any navigation, not just its own links:
    // a search from the menu's field navigates from inside quick-search
    this.routerSubscription = this.router.events.subscribe(event => {
      // "Calibr admins" links to the proposals tab but stands for every admin tab
      if (event instanceof NavigationEnd) {
        this.inAdmin = event.urlAfterRedirects.startsWith('/internal');
      }
      if (event instanceof NavigationEnd && this.expanded) {
        this.expanded = false;
        // Drop focus from the search field so the phone keyboard closes too
        const active = document.activeElement as HTMLElement;
        if (active && active.blur) { active.blur(); }
      }
    });
  }

  // Publishes the sticky header's rendered height as --site-header-height, so
  // sticky sub-headers and table headers further down can sit right under it
  // (see the sticky-subheader and sticky-table-head mixins in _design.scss).
  // A ResizeObserver catches every size change, whatever the cause.
  ngAfterViewInit(): void {
    const publish = () => this.document.documentElement.style.setProperty(
      '--site-header-height', this.elementRef.nativeElement.offsetHeight + 'px');
    const RO = (window as any).ResizeObserver;
    if (RO) {
      this.resizeObserver = new RO(publish);
      this.resizeObserver.observe(this.elementRef.nativeElement);
    } else {
      publish();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) { this.resizeObserver.disconnect(); }
    if (this.loginSubscription) { this.loginSubscription.unsubscribe(); }
    if (this.routerSubscription) { this.routerSubscription.unsubscribe(); }
  }

  ngOnInit(): void {
    this.loginSubscription = this.loginStateService.isUserLoggedIn
      .subscribe((state: LoginState) => {
        this.loggedIn = state.loggedIn;
        this.hasPortal = hasPortal(state.role);
        this.loginBox = false;
        this.expanded = false;

        // Signed out on an admin page: there's nothing left to show there
        if (!state.loggedIn && this.router.url.startsWith('/internal')) {
          this.router.navigate(['/']);
        }
      });
  }

  showLogin() {
    this.loginBox = !this.loginBox;
  }

  // Other pages ask for the sign-in box with
  // window.dispatchEvent(new CustomEvent('reframe-sign-in'))
  // (optionally with { detail: { mode: 'register' | 'forgot' } }; user-login
  // picks the view)
  @HostListener('window:reframe-sign-in')
  openLogin() {
    if (this.loggedIn) { return; }
    // Wait for the click that asked to finish bubbling, or the document
    // click handler below closes the box straight away
    setTimeout(() => {
      this.loginBox = true;
      if (this.isMobile) { this.expanded = true; }
      window.scrollTo(0, 0);
    });
  }

  // Account dialogs close the box so it doesn't sit behind them
  // (window.dispatchEvent(new CustomEvent('reframe-close-sign-in')))
  @HostListener('window:reframe-close-sign-in')
  closeLogin() {
    this.loginBox = false;
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

  // Search button in the phone bar: open the menu with the field focused
  openSearch() {
    this.expanded = true;
    setTimeout(() => {
      const input = document.getElementById('search-box-add') as HTMLInputElement;
      if (input) { input.focus(); }
    });
  }

  @HostListener('document:keydown.escape') onEscape() {
    if (this.expanded && !this.loginBox) { this.expanded = false; }
  }

  checkMobile() {
    this.isMobile = window.matchMedia('(max-width: 760px)').matches;
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
