import { Component, OnInit, AfterViewInit, OnDestroy, forwardRef, Inject, Injectable, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Http, Response } from "@angular/http";
import { Location } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

// import { InteractionTableDataService } from "../interaction-table/interaction-table.component"

import {
  HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams, HttpRequest,
  HttpResponse
} from "@angular/common/http";

import { LoginState, AvailableData } from '../_models/index';
import { WDQService, LoginStateService, CompoundService } from '../_services/index';
import { environment } from "../../environments/environment";


@Component({
  outputs: ['cid'],
  selector: 'app-compound-data',
  templateUrl: './compound-data.component.html',
  styleUrls: ['./compound-data.component.scss'],
})
export class CompoundDataComponent implements OnInit, AfterViewInit, OnDestroy {
  qid: string;
  id: string;
  smiles: string;
  loggedIn: boolean;
  showVendor: boolean = false;

  // Drives app-compound-header's collapse-to-minimal state. Has to live
  // here rather than inside CompoundHeaderComponent itself: that component
  // is sticky, so a sentinel placed inside it would get pinned in place
  // along with everything else and never scroll out of view to trigger
  // anything. This sentinel sits in normal document flow right before
  // <app-compound-header>, so it actually scrolls with the page.
  @ViewChild('headerSentinel') headerSentinel: ElementRef;
  headerScrolled: boolean = false;
  private headerSentinelObservers: IntersectionObserver[] = [];
  // label: string;
  tableData: Array<Object> = [];
  aliases: Array<string> = [];
  chemVendors: Array<Object> = [];
  table_data: Array<Object> = [];

  idData: Array<Object> = [];

  cmpdAvailData: Array<AvailableData> = [];

  // Parameters for similarity results
  num_similar_per_page: number = 3;

  // Meta tags
  meta_tags = [];

  meta_title: string = ' data | reframeDB';
  meta_descrip: string = ' data from reframeDB, including assay hit data, chemical properties, and biological properties (if available)';


  constructor(
    @Inject(forwardRef(() => WDQService)) public wd: WDQService,
    private route: ActivatedRoute,
    private router: Router,
    // private http: Http,
    private http2: HttpClient,
    private titleService: Title,
    private loginStateService: LoginStateService,
    private compoundService: CompoundService,
    // public searchSvc: BackendSearchService,
    public _location: Location,
    private meta: Meta
  ) {
    // Add url to meta tag
    this.meta.updateTag({ property: 'og:url', content: window.location.href });

    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    }

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd)
        this.router.navigated = false;
    })

    this.route.params.subscribe(params => {
      // console.log('routing... ')
      this.compoundService.idSubject.next({ id: params['id'], qid: params['qid'] });
    });

    // Pass along available data binaries to app-available-data
    this.compoundService.availState.subscribe((availData: AvailableData[]) => {
      // console.log(availData)
      this.cmpdAvailData = availData;
    })

    // Generate SMILES for structure viewer
    this.compoundService.smilesState.subscribe((smiles: string) => {
      // console.log(smiles)
      this.smiles = smiles;
    });

    this.compoundService.nameState.subscribe((cmpdName: string) => {
      if (!cmpdName) {
        // If there's no name for the compound, set a generic title
        cmpdName = 'compound'
      }
      this.titleService.setTitle(cmpdName + " | reframeDB");

      // Set meta tags
      this.meta_tags.push({ name: 'description', content: cmpdName + this.meta_descrip });
      this.meta_tags.push({ property: 'og:description', content: cmpdName + this.meta_descrip });

      this.meta_tags.push({ property: 'og:title', content: cmpdName + this.meta_title });

      for(let i=0; i < this.meta_tags.length; i++){
        this.meta.updateTag(this.meta_tags[i]);
      }
    })

    loginStateService.isUserLoggedIn.subscribe((logState: LoginState) => {
      this.loggedIn = logState.loggedIn
    })
  }




  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.headerSentinel) {
      const el = this.headerSentinel.nativeElement;

      // Hysteresis via two observers on the same sentinel, each only ever
      // moving the state one direction: collapse fires at a smaller margin
      // (80px scrolled), expand fires at a larger one (200px). Between
      // those two points neither one changes anything, so a scroll position
      // that hovers near a single boundary (mouse wheel, trackpad momentum)
      // can't flip the state back and forth every frame - it did with only
      // one observer/threshold.
      const collapseObserver = new IntersectionObserver(
        (entries) => { if (!entries[0].isIntersecting) { this.headerScrolled = true; } },
        { rootMargin: '80px 0px 0px 0px', threshold: 0 }
      );
      const expandObserver = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) { this.headerScrolled = false; } },
        { rootMargin: '200px 0px 0px 0px', threshold: 0 }
      );
      collapseObserver.observe(el);
      expandObserver.observe(el);
      this.headerSentinelObservers = [collapseObserver, expandObserver];
    }
  }

  ngOnDestroy() {
    this.headerSentinelObservers.forEach(o => o.disconnect());
  }


  // showMore(clickEvent, qid: string): void {
  //   let elementID: string = clickEvent.srcElement.id;
  //
  //   this.displayShowMorePane = !this.displayShowMorePane;
  // }


}
