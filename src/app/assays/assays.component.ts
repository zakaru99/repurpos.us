import { Component, OnInit, forwardRef, Inject, Injectable, Input } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { Http, Response } from "@angular/http";
import { Title, Meta } from '@angular/platform-browser';

import * as d3 from 'd3';
import * as chroma from 'chroma-js';

import { AssayDetails } from '../_models/index';
import { ColorPaletteService } from '../_services/index';

import { StandardizeAssayTypePipe } from '../_pipes/standardize-assay-type.pipe';

@Component({
  selector: 'app-assays',
  // pipes: [SciItalicizePipe],
  templateUrl: './assays.component.html',
  styleUrls: ['./assays.component.scss']
})

export class AssaysComponent implements OnInit {
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

  meta_tags = [
    { property: 'og:title', content: 'reframeDB assay descriptions' },
    { name: 'description', content: 'List of assays performed on the reframeDB compound library' },
    { property: 'og:description', content: 'List of assays performed on the reframeDB compound library' },
    { property: 'og:url', content: 'https://reframedb.org/assays' }
  ];

  constructor(
    // private route: ActivatedRoute,
    private colorSvc: ColorPaletteService,
    private titleService: Title,
    private stdize: StandardizeAssayTypePipe,
    private meta: Meta) {

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

  }

  ngOnInit() {
    this.retrieveAssayList();
    this.titleService.setTitle("assays | reframeDB");
  }


  retrieveAssayList() {
    this.colorSvc.assaysState.subscribe((aList: Object) => {
      if (aList) {
        this.assayList = aList['assayList'];
        this.selAssays = this.assayList;

        // Standardize values
        this.assayList.forEach((d: any) => {
          d['type_arr'] = d.assay_type.split(',').map(d => this.stdize.transform(d));
        })

        // Populate fullTypes
        this.fullTypes = this.assayList.map((d: any) => d.type_arr)
          .reduce((acc, val) => acc.concat(val), []);

          // Keep types for current filtering purposes
        this.types = [...this.fullTypes]; // Initialize types to all options

        this.typeDomain = d3.nest()
          .key((d: any) => d)
          .rollup((leaves: any) => leaves.length)
          .entries(this.assayList.map((d: any) => d.type_arr).reduce((acc, val) => acc.concat(val), []))
          .sort((a: any, b: any) => b.value - a.value || a.key - b.key)
          .map(d => d.key);

        this.setTypeColors(this.assayList);
        this.indications = this.assayList.map(assay => assay.indication);

        this.indicColorScale = aList['colorScale'];
      }
    })
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

    const selectElement = document.getElementById('typeSelect') as HTMLSelectElement; // Get the select element
    if (selectElement) {
      selectElement.value = selectedType; // Set the selected value
    }

    
    // Call filterType with the selected type wrapped in an array
    if(selectedType != 'see all'){
      this.filterType([selectedType]);
    }else{
      this.removeFilter();
    }
    
  }
  
  filterType(types: string[]) {
    this.filter = types;  // Update the filter with selected types
    console.log(this.filter);
    
    // Filter selAssays based on the selected types
    this.selAssays = this.assayList.filter((d: any) => 
      (d.type_arr.filter(type => this.filter.includes(type))).length > 0
    );
  
    console.log(this.selAssays);
  
    // Update filter colors based on selected types
    this.filter_color = types.map(d => this.getTypeColor(d)[1]);
    this.isFiltered = true;  // Set filter state
    this.getAssayKinds();  // Call additional logic if needed
  }

  removeFilter() {
    this.selAssays = this.assayList;
    this.isFiltered = false;
    this.colorSvc.selectedTypeSubject.next(null);
    this.getAssayKinds();
  }

  getAssayKinds() {
    this.indications = this.selAssays.map(assay => assay.indication);
    this.types = this.selAssays.map((d: any) => d.type_arr).reduce((acc, val) => acc.concat(val), []);
  }

  getDistinctTypes(): string[] {
    return Array.from(new Set(this.fullTypes)); // Use the fullTypes array
  }

}
