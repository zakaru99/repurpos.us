import { Component, OnInit, forwardRef, Inject, Injectable, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { Subscription } from 'rxjs';

import { AssayPlotsComponent } from './assay-plots/assay-plots.component'
import { AssayDetails } from '../_models/assay-details';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssayMetadataService } from '../_services/';
declare var $ : any

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

  // Updated parsePrimaryScreened() to accept a parameter
  parsePrimaryScreened(value: string): number {
    console.log(value)
    if (value === 'secondary') {
      return NaN;  // Return NaN if value is 'secondary'
    }
    return parseInt(value, 10);  // Parse the value as an integer
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

  clickedPSD(assay_id){
    $.ajax({
        type: "POST",
        async: false,
        data: {assay_id: assay_id},
        url: "/php/pd_check.php",
        success: function(response){
          if(response == 1){
            var filepath = '../../assets/primary_files/' + assay_id + '_primary_screening_data.xlsx';
            window.location.href = filepath;
          }
          else
          {
            alert("there is currently no primary screening data available for assay " + assay_id);
          }
        }
      });
  }
}
