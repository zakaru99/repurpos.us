import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { CompoundService } from '../../_services/index';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Compound } from '../../_models';
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
              var filepath = '../../assets/QC_files/' + fileData[i].upload_id + fileData[i].extension;
              //var file_name = fileData[i].file_name.substring(0, fileData[i].file_name.length-4) +  fileData[i].extension;
              var file_name = fileData[i].file_name.split('.')[0];
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
