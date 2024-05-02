import { Component, OnInit, Input } from '@angular/core';

import { VendorData} from '../../_models/index';
import { CompoundService } from '../../_services/index';

@Component({
  selector: 'app-compound-ontology-data',
  templateUrl: './compound-ontology-data.component.html',
  styleUrls: ['./compound-ontology-data.component.scss']
})

export class CompoundOntologyDataComponent implements OnInit {
  private vendors: Array<Object> = [
    { 'name': 'GVK Excelra GoStar', 'link': 'https://gostardb.com/gostar/loginEntry.do', 'id': 'gvk', 'updated': ''},
    { 'name': 'Clarivate Integrity', 'link': 'https://www.cortellis.com/drugdiscovery/home', 'id': 'integrity', 'updated': ''},    
    { 'name': 'Citeline Pharmaprojects', 'link': 'https://pharmaintelligence.informa.com/contact/contact-us', 'id': 'informa', 'updated': ''}, //needs to be above adis to work
    { 'name': 'Ontology', 'link': 'https://google.com','id': 'ontology', 'updated': ''}, //needs to be above adis to work
  ];

  public vendor_data: VendorData;

  constructor(private cmpdSvc: CompoundService) {
    this.cmpdSvc.vendorState.subscribe((vdata: VendorData) => {
      this.vendor_data = vdata;
    })
  }

  ngOnInit() {
  }

  ontology_text = 'Show Data'
  hide_ontology: boolean = true;
  toggle_ontology(){
    this.hide_ontology = !this.hide_ontology; 
    if(this.hide_ontology == true){
      this.ontology_text = 'Show Data'
    }else{
      this.ontology_text = 'Hide Data'
    }
  }

}
