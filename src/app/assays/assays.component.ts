import { Component, OnInit, forwardRef, Inject, Injectable, Input } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { Http, Response } from "@angular/http";
import { Title, Meta } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

import * as d3 from 'd3';
import * as chroma from 'chroma-js';

import { AssayDetails } from '../_models/index';
import { ColorPaletteService } from '../_services/index';
import { AssayDetailsModalComponent } from '../_dialogs/assay-details-modal/assay-details-modal.component';

import { StandardizeAssayTypePipe } from '../_pipes/standardize-assay-type.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-assays',
  // pipes: [SciItalicizePipe],
  templateUrl: './assays.component.html',
  styleUrls: ['./assays.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class AssaysComponent implements OnInit {
  queryString: string = '';

  assaysFound: number = 0;

  assayList: AssayDetails[] = [];
  selAssays: AssayDetails[] = [];
  // store unique indications
  indications: string[];
  types: string[];
  fullTypes: string[] = []; 
  typeDomain: string[]
  // map to indication colors
  typeColorScale: any;
  indicColorScale: any;
  isFiltered: boolean = false;
  filter: string[];
  filter_color: string[];

  totalAssays: AssayDetails[] = [];
  secondaryNum: AssayDetails[] = [];
  publishshedDrNum: AssayDetails[] = [];
  publishedPdataNum: AssayDetails[] = [];
  unavailablePrimaryNum: AssayDetails[] = [];
  pendingAssayNum: AssayDetails[] = [];
  statusView: 'all' | 'published' | 'pending' = 'all';
  sliderTransform: string = 'translateX(0%)';

  isMobile: boolean = false;
  flatStatuses: { group: string; status: string }[] = [];
  statusCounts: { [status: string]: number } = {};

  meta_tags = [
    { property: 'og:title', content: 'reframeDB assay descriptions' },
    { name: 'description', content: 'List of assays performed on the reframeDB compound library' },
    { property: 'og:description', content: 'List of assays performed on the reframeDB compound library' },
    { property: 'og:url', content: 'https://reframedb.org/assays' }
  ];

  constructor(
    private colorSvc: ColorPaletteService,
    private titleService: Title,
    private stdize: StandardizeAssayTypePipe,
    private meta: Meta,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog) {

    for (let i = 0; i < this.meta_tags.length; i++) {
      this.meta.updateTag(this.meta_tags[i]);
    }

    this.colorSvc.selectedIndicationState.subscribe(indication => {
      if (indication) {
        this.filterIndic(indication);
      }
    })

    this.colorSvc.selectedTypeState.subscribe(types => {
      if (types) {
        this.filterType(types);
      }
    })
    this.checkMobile()
  }

  ngOnInit() {
    this.statusesGrouped.forEach(group => {
    group.options.forEach(status => {
      this.flatStatuses.push({ group: group.label, status });
    });
  });

    this.route.queryParams.subscribe(params => {
      this.queryString = params.query || '';
      this.retrieveAssayList();
    })

    this.retrieveAssayList();
    this.titleService.setTitle("assays | reframeDB");
  }
  
  getCounts(){
    this.totalAssays = this.assayList;
    this.secondaryNum = this.selAssays.filter(a => a.primary_screened === 'secondary')
    this.publishshedDrNum = this.selAssays.filter(a => a.published === true);
    this.publishedPdataNum = this.selAssays.filter(a => !isNaN(Number(a.primary_screened)));
    this.unavailablePrimaryNum = this.selAssays.filter(a => a.primary_screened === 'not available')
    this.pendingAssayNum = this.assayList.filter(a => a.published === false && a.publish_date && new Date(a.publish_date) > new Date())
  }

  private getFilteredAssays(query: string, types: string[] = []): AssayDetails[] {
    const search = query.toLowerCase().trim();
  
    let baseList = this.assayList;
  
    // Apply search filter first
    if (search.length > 0) {
      baseList = baseList.filter((assay: AssayDetails) =>
        (assay.assay_id && assay.assay_id.toLowerCase().includes(search)) ||
        (assay.assay_title && assay.assay_title.toLowerCase().includes(search)) ||
        (assay.title_short && assay.title_short.toLowerCase().includes(search)) ||
        (assay.purpose && assay.purpose.toLowerCase().includes(search)) ||
        (assay.summary && assay.summary.toLowerCase().includes(search))
      );
    }
  
    // Then apply type filter if any
    if (types.length > 0) {
      baseList = baseList.filter((d: any) =>
        d.type_arr.some(type => types.includes(type))
      );
    }
  
    return baseList;
  }
  


  retrieveAssayList() {
    this.colorSvc.assaysState.subscribe((aList: Object) => {
      if (!aList) return;
  
      this.assayList = aList['assayList'];
      this.getCounts()
      //Standardize
      this.assayList.forEach((d: any) => {
        d['type_arr'] = d.assay_type.split(',').map(d => this.stdize.transform(d));
      });
  
      this.fullTypes = this.assayList
        .map((d: any) => d.type_arr)
        .reduce((acc, val) => acc.concat(val), []);
  
      //First apply search only (no type filter yet)
      const searchFiltered = this.getFilteredAssays(this.queryString);
  
      //Populate type dropdown from search results
      this.getAssayKinds(searchFiltered);
  
      //Then apply type filter if active
      const baseFiltered = this.getFilteredAssays(this.queryString, this.filter ? this.filter : []);

      this.computeStatusCounts(baseFiltered);

    this.selAssays = this.applyStatusScope(baseFiltered);

  
      this.assaysFound = this.selAssays.length;
      this.isFiltered = this.queryString.trim().length > 0 || (this.filter && this.filter.length > 0);
  
      this.setTypeColors(this.assayList);
      this.indicColorScale = aList['colorScale'];
    });
  }
  
  
  private computeStatusCounts(list: AssayDetails[]) {

    // Reset counts
    this.statusCounts = {};

    // Initialize all statuses to 0
    this.statusesGrouped.forEach(group => {
      group.options.forEach(status => {
        this.statusCounts[status] = 0;
      });
    });

    // Count occurrences
    list.forEach(a => {
      if (this.statusCounts[a.status] !== undefined) {
        this.statusCounts[a.status]++;
      }
    });

    // Optional: total count for "All"
    this.statusCounts['All'] = list.length;
  }

  setTypeColors(assayList) {
    this.types = assayList.map((d: any) => d.type_arr).reduce((acc, val) => acc.concat(val), []);

    let colors = this.colorSvc.uniqueColors;
    let typeColors = [
      colors['brown'], // cell
      colors['magenta'], // HCI
      colors['green'], // viability
      colors['aquamarine'], // biochem
      colors['purple-blue'], // enzy
      colors['brand-red'], // cytotox

      colors['orange'], // phenotypic
      colors['navy'],
      colors['jade'],
      colors['purple'],
      colors['pink'],
      colors['default'],
      colors['emerald'],
      colors['lt-brown'],
      colors['khaki'],
      colors['mauve'],
      colors['med-blue'],
      colors['orange-red'],
      colors['brand-blue'],
      colors['lt-pink'],
      colors['teal'],
      colors['lt-green'],
      colors['violet'],
      colors['avocado']
    ]

    // hijack d3's color scale mapping
    this.typeColorScale = d3.scaleOrdinal().domain(this.types).range(typeColors)
  }

  getTypeColor(type: string) {
    let sel_color = chroma(this.typeColorScale(this.stdize.transform(type)));

    return ([sel_color.luminance(0.95), sel_color]);
  }

  filterIndic(indication: string) {
    this.selAssays = this.assayList.filter((d: any) => d.indication === indication);
    this.filter_color = [<string>this.colorSvc.getIndicColor(indication)['bg1']];
    this.filter = [indication];
    this.isFiltered = true;
    this.getAssayKinds();
  }

  // filterType(types: string[]) {
  //   this.filter = types;
  //   console.log(this.filter);
  //   this.selAssays = this.assayList.filter((d: any) => (d.type_arr.filter(type => this.filter.includes(type))).length > 0);

  //   console.log(this.selAssays)

  //   this.filter_color = types.map(d => this.getTypeColor(d)[1]);
  //   this.isFiltered = true;
  //   this.getAssayKinds();
  // }

  onTypeSelected(selectedType: string) {
    if (selectedType !== 'see all') {
      this.filterType([selectedType]);
    } else {
      this.filter = []; // Clear type filter only
      this.selAssays = this.getFilteredAssays(this.queryString, []);
      this.assaysFound = this.selAssays.length;
      this.isFiltered = this.queryString.trim().length > 0;
      this.getAssayKinds();
    }
  }
  
  
  filterType(types: string[]) {
    this.filter = types;
    this.selAssays = this.getFilteredAssays(this.queryString, types);
    this.assaysFound = this.selAssays.length;
    this.isFiltered = true;
    this.getAssayKinds();
  }
  
  

  // removeFilter() {
  //   this.selAssays = this.assayList;
  //   this.isFiltered = false;
  //   this.colorSvc.selectedTypeSubject.next(null);
  //   this.getAssayKinds();
  // }

  getAssayKinds(baseList: AssayDetails[] = this.selAssays) {
    this.types = baseList.map((d: any) => d.type_arr).reduce((acc, val) => acc.concat(val), []);
  }
statusGroupColors: { [key: string]: string } = {
  'Pre-Screen': '#B8C0FF',     // soft indigo
  'Screening': '#7DCBFF',      // soft blue
  'Completed': '#9FD3A6'       // soft green
};

getStatusColor(status: string): string {

  if (!status) return '#E0E0E0';

  for (const group of this.statusesGrouped) {
    if (group.options.includes(status)) {
      return this.statusGroupColors[group.label] || '#E0E0E0';
    }
  }

  // fallback
  return '#E0E0E0';
}

applyStatusScope(list: AssayDetails[]): AssayDetails[] {

  if (!this.selectedStatus || this.selectedStatus === 'All') {
    return list;
  }

  return list.filter(a => a.status === this.selectedStatus);
}


statusesGrouped = [
  {
    label: 'Pre-Screen',
    options: [
      'ReFRAME Waiting for MTA',
      'ReFRAME MTA Signed',
      'ReFRAME LOPAC'
    ]
  },
  {
    label: 'Screening',
    options: [
      'ReFRAME Primary Screen Sent',
      'ReFRAME Dose Response Sent',
      'ReFRAME Dose Response Data Received'
    ]
  },
  {
    label: 'Completed',
    options: [
      'ReFRAME Screen Completed',
      'ReFRAME Completed but need milestones',
      'ReFRAME Screen Terminated and Closed'
    ]
  }
];

selectedStatus = 'All';

setStatusView(status: string) {
  this.selectedStatus = status;
  this.retrieveAssayList();
  console.log('Filtering by:', status);
}

showDetails(
  type: 'all' | 'primary' | 'published' | 'pending' | 'unavailable'
): void {

  let title = '';
  let assays: AssayDetails[] = [];

  switch (type) {

    case 'all':
      title = 'All Assays in Workflow';
      assays = this.totalAssays;
      break;

    case 'primary':
      title = 'Published Primary Data Assays';
      assays = this.publishedPdataNum;
      break;

    case 'published':
      title = 'Published Dose Response Assays';
      assays = this.publishshedDrNum;
      break;

    case 'pending':
      title = 'Pending Dose Response Assays';
      assays = this.pendingAssayNum;
      break;

    case 'unavailable':
      title = 'Unavailable Primary Data Assays';
      assays = this.unavailablePrimaryNum;
      break;
  }

  this.dialog.open(AssayDetailsModalComponent, {
    width: '650px',
    panelClass: 'crest-dialog',
    data: { title, assays }
  });
}
  getDistinctTypes(): string[] {
    const baseFiltered = this.getFilteredAssays(this.queryString, []); // Only use search term
    const filteredTypes: string[] = baseFiltered
      .map((d: any) => d.type_arr)
      .reduce((acc, val) => acc.concat(val), []);
  
    return Array.from(new Set(filteredTypes)).sort(); // deduplicated + sorted
  }
  
  clearSearch(){
    this.router.navigate([], {
      queryParams: {}, // Clears all query parameters
      queryParamsHandling: '' // Optional: Keeps existing parameters if not specified
    });

    this.retrieveAssayList()
  }

  onEnter() {
    let curr_query = this.queryString;
    this.queryString = '';
    console.log(curr_query)
    this.router.navigate(['assays/'], {
      queryParams:
        {
          query: curr_query,
        }
    });
  }

  get showClearButton(): boolean {
    return this.queryString.trim().length > 0;
  }

  checkMobile() {
    if (window.matchMedia('(max-width: 900px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
}
