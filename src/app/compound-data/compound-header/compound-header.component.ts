import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { CompoundService } from '../../_services/index';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { AssayData, Compound } from '../../_models';
declare var $ : any

@Component({
  selector: 'app-compound-header',
  templateUrl: './compound-header.component.html',
  styleUrls: ['./compound-header.component.scss']
})

export class CompoundHeaderComponent implements OnInit {
  @Input() results_per_page: number;
  @Input() _location: Location;

  public label: string;
  public aliases: Array<string> = [];
  public reframeCmpd: string;
  public whoName: string;
  public chemVendors: Array<Object> = [];
  public similarityResults: Array<Compound> = [];

  public isToxicA00295 = false;
  public hasA00295Data = false;
  public isToxicA00296 = false;
  public hasA00296Data = false; 
  public assayData: AssayData[] = [];

  public integrityPediatrics: boolean = false;

  num_aliases: number;
  all_shown: boolean = false;
  alias_ct: number;


  constructor(private cmpdSvc: CompoundService) {
    this.getNumAliases();

    this.cmpdSvc.nameState.subscribe(cmpdName => {
      // console.log(cmpdName)
        this.label = cmpdName;
    })

    this.cmpdSvc.rfmState.subscribe((rfm: string) => {
      this.reframeCmpd = rfm;
    })

    this.cmpdSvc.whoState.subscribe((who: string) => {
      this.whoName = who;
    })

    this.cmpdSvc.aliasState.subscribe((aliasList: string[]) => {
      this.aliases = aliasList;
    })

    this.cmpdSvc.chemSourceState.subscribe((sources: Object[]) => {
      this.chemVendors = sources;
    })

    this.cmpdSvc.similarState.subscribe((sdata: Compound[]) => {
      this.similarityResults = sdata;
    })

    this.cmpdSvc.assaysState.subscribe((assays: AssayData[]) =>{
      this.assayData = assays;
      this.checkToxicity();
    })
    this.cmpdSvc.integrityPediatricsState.subscribe((integrityPediatrics: boolean) => {
      this.integrityPediatrics = integrityPediatrics;
    })
  }
  
checkToxicity(): void {
  if (!this.assayData || this.assayData.length === 0) {
    this.isToxicA00295 = false;
    this.hasA00295Data = false;
    this.isToxicA00296 = false;
    this.hasA00296Data = false;
    return;
  }

  const a00295Assays = this.assayData.filter(x =>
    x.assay_id === 'A00295' &&
    x.activity_type &&
    x.activity_type.toUpperCase() === 'IC50' &&
    !isNaN(Number(x.ac50))
  );

  this.hasA00295Data = a00295Assays.length > 0;

  this.isToxicA00295 = a00295Assays.some(x =>
    Number(x.ac50) < 1e-5 
);

  const a00296Assays = this.assayData.filter(x =>
    x.assay_id === 'A00296' &&
    x.activity_type &&
    x.activity_type.toUpperCase() === 'IC50' &&
    !isNaN(Number(x.ac50))
  );

  this.hasA00296Data = a00296Assays.length > 0;

  this.isToxicA00296 = a00296Assays.some(x =>
    Number(x.ac50) < 1e-5 
  );
}


  onAnchorClick(anchor_tag: string) {
    let anchor_div = document.querySelector("#" + anchor_tag);
    if (anchor_div) {
      anchor_div.scrollIntoView();
    }
  }

  backClick() {
    this._location.back();
  }

  

  ngOnInit() {
    this.checkToxicity();
  }

  showMore() {
    if (this.all_shown) {
      this.alias_ct = this.num_aliases;
    } else {
      this.alias_ct = this.aliases.length;
    }
    this.all_shown = !this.all_shown;
  }

  getNumAliases() {
    // determine how many aliases to show
        if (window.screen.width > 800) {
          this.num_aliases = 15;
        } else {
          this.num_aliases = 5;
        }
        this.alias_ct = this.num_aliases;
  }

  onResize(event) {
    this.getNumAliases();
  }





  clickedQC(vendor_ikey){

    function saveAs(uri, filename) {
      var link = document.createElement('a');
      if (typeof link.download === 'string') {
          document.body.appendChild(link); // Firefox requires the link to be in the body
          link.download = filename;
          link.href = uri;
          link.click();
          document.body.removeChild(link); // remove the link when done
      } else {
          location.replace(uri);
      }
  }

    $.ajax({
      type: "POST",
      async: false,
      url: "https://reframedb.org/php/getQCdownloadID.php",
      data: {ikey: vendor_ikey},
      dataType:'JSON', 
      success: function(response){
          var fileData = response.data;
          if(fileData !== undefined)
          {
            for (var i=0; i<fileData.length; i++)
            {
              //console.log('downloading file id:' + fileData[i].upload_id + ' name: ' + fileData[i].file_name);
              console.log(fileData[i]);
              var filepath = '../../assets/QC_files/' + fileData[i].upload_id + fileData[i].extension;
              //var file_name = fileData[i].file_name.substring(0, fileData[i].file_name.length-4) +  fileData[i].extension;
              if(fileData[i].extension == '.pdf'){
                var file_name = fileData[i].file_name.split('.')[0];
              }else{
                var file_name = fileData[i].file_name;
              }
              saveAs(filepath, file_name);
            }
          }
          else
          {
            alert("sorry, QC data for this compound is not yet available");
          }
        }
    });

}
}
