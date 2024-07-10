import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

import { Subscription, combineLatest } from 'rxjs';
import { LoginStateService, PrimaryDataService } from '../../_services';


@Component({
  selector: 'app-psd-dwnld',
  templateUrl: './psd-dwnld.component.html',
  styleUrls: ['./psd-dwnld.component.scss']
})
export class PsdDwnldComponent{
  @Input() aid: string;
  private data: Array<any>;
  private dataSubscription: Subscription;
  private loginSubscription: Subscription;
  public loggedIn: boolean;
  public has_data = false;
  
  
  constructor(
    private psdSvc: PrimaryDataService, 
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private loginStateService: LoginStateService
  ) {
    this.dataSubscription = this.psdSvc.flatPSDDataSubject$.subscribe(data => {
      this.data = data;
      if(this.data.length >= 1){
        this.has_data = true;
      }
      
    })


    this.loginSubscription =
      combineLatest(loginStateService.isUserLoggedIn, route.params).subscribe(([login, params]) => {
        if (login.loggedIn === true && params['aid']) {
          this.loggedIn = true;
          this.aid = params['aid'];
          this.psdSvc.retrievePrimaryData(this.aid)
        }
      })
  }

  ngOnDestroy() {
    this.psdSvc.clearPrimaryData();
    this.dataSubscription.unsubscribe();
  }

  // Manual dictionary to translate
  colnames_dict = {
    "ikey": "ikey", "smile": "smile", "hit": "hit", "assay_id": "assay_id", "indication": "indication", "assay_title": "assay_title"
  }

  //---------------------------------------------------------------------------------------
  dwnldCSV() {
    if(this.data.length >= 1){
      console.log(this.data.length)
      this.dwnldDelim(",", "csv")
    }else{
      alert('primary data is not yet available for this assay');
      return false;
    }
    
  }

  dwnldDelim(columnDelimiter: string, extension: string) {

    const lineDelimiter = '\n';

    let colnames = ["ikey", "smile", "hit", "assay_id", "indication", "assay_title"];
    let colnames_transformed = colnames.map(d => this.colnames_dict[d] || d) // convert to their longer name, if they have one. If not, return the existing value

    var dwnld_data = '';
    dwnld_data += colnames_transformed.join(columnDelimiter);
    dwnld_data += lineDelimiter;

    this.data.forEach(function(item) {
      let tmp = {
        "ikey": item['ikey'],
        "smile": item['smile'],
        "hit": item['hit'],
        "assay_id": item['assay_id'],
        "indication": item['indication'],
        "assay_title": item['assay_title']
      }

      let counter = 0;
      colnames.forEach(function(key) {
        if (counter > 0) dwnld_data += columnDelimiter;
        // enquote all data, to deal with commas in data
        dwnld_data += '"';
        dwnld_data += tmp[key];
        dwnld_data += '"';
        counter++;
      });
      dwnld_data += lineDelimiter;
    });
    
    save_data(dwnld_data, extension, this.aid)
  }
}

function save_data(dwnld_data, file_type, assay_id) {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/tsv;charset=utf-8,' + encodeURIComponent(dwnld_data);
  hiddenElement.target = '_blank';

  hiddenElement.download = `${assay_id}_primary-screening-data.${file_type}`;
  // Gotta actually append the hidden element to the DOM for the click to work in Firefox
  // https://support.mozilla.org/en-US/questions/968992
  document.body.appendChild(hiddenElement);
  hiddenElement.click();
}
