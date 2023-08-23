import { Component, OnInit, forwardRef, Inject, Injectable, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { Subscription } from 'rxjs';

import { AssayPlotsComponent } from './assay-plots/assay-plots.component'
import { AssayDetails } from '../_models/assay-details';

import { AssayMetadataService } from '../_services/';

@Component({
  selector: 'app-assay-data',
  templateUrl: './assay-data.component.html',
  styleUrls: ['./assay-data.component.scss']
})

export class AssayDataComponent implements OnInit {
  assayDetails: AssayDetails;
  assayDetailsSubscription: Subscription;
  aid: string;

  meta_tags = [];

  meta_url: string = 'https://reframedb.org/assays/';
  meta_title: string = ' assay data and protocol | reframeDB';
  meta_descrip: string = 'reframeDB assay data and protocol for ';

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta,
    private assaySvc: AssayMetadataService
  ) {
    route.params.subscribe(params => {
      this.aid = params['aid'];
    });
  }

  ngOnInit() {
    this.assayDetailsSubscription = this.assaySvc.retrieveAssayList(this.aid).subscribe(result => {
      this.assayDetails = result;

      // Set meta tags for description, etc.
      this.meta_tags.push({ name: 'description', content: this.meta_descrip + this.assayDetails.title_short });
      this.meta_tags.push({ property: 'og:description', content: this.meta_descrip + this.assayDetails.title_short });
      this.meta_tags.push({ property: 'og:url', content: this.meta_url + this.aid });
      this.meta_tags.push({ property: 'og:title', content: this.assayDetails.title_short + this.meta_title });

      for (let i = 0; i < this.meta_tags.length; i++) {
        this.meta.updateTag(this.meta_tags[i]);
      }

      // Set title for the page
      this.titleService.setTitle(this.assayDetails.title_short + " | reframeDB");
    });
  }

  onAnchorClick(anchor_tag: string) {
    let anchor_div = document.querySelector("#" + anchor_tag);
    if (anchor_div) {
      anchor_div.scrollIntoView();
    }
  }

  ngOnDestroy() {
    this.assayDetailsSubscription.unsubscribe();
  }


 validatePSD(psdassayID)
  { 
    var filepath = '../../assets/primary_screening_data/' + psdassayID + '_primary_screening_data.xlsx';
    var psdArray = ['A00272', 'A00385', 'A00386', 'A00411', 'A00493', 'A00190', 'A00398', 'A00462', 'A00277', 'A00279', 'A00281', 'A00294', 'A00331', 'A00343', 'A00350', 'A00354', 'A00357', 'A00366', 'A00375', 'A00378', 'A00383', 'A00507', 'A00238', 'A00172', 'A00229', 'A00230', 'A00203', 'A00191', 'A00250', 'A00196', 'A00091', 'A00197', 'A00198', 'A00093', 'A00636', 'A00657', 'A00635' ];
    //var psdassayID = filepath.substring(36, 42);
    if(psdArray.includes(psdassayID))
    {
      window.location.href = filepath;
    }
    else
    {
      alert("there is currently no primary screening data available for assay " + psdassayID);
    }
  }
}
