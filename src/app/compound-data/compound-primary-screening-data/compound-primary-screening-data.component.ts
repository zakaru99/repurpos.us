import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PrimaryScreenData } from '../../_models/index';
import { CompoundService, ColorPaletteService } from '../../_services';

@Component({
  selector: 'app-primary-screening-data',
  templateUrl: './compound-primary-screening-data.component.html',
  styleUrls: ['./compound-primary-screening-data.component.scss']
})
export class CompoundPrimaryScreeningDataComponent implements OnInit {
  primaryData: Array<PrimaryScreenData> = [];

  constructor(private cmpdSvc: CompoundService, public colorSvc: ColorPaletteService) { }

  ngOnInit() {
    this.cmpdSvc.primaryDataState.subscribe((pd: PrimaryScreenData[]) => {
      this.primaryData = pd;

    })
  }

  psd_text = 'Show Data'
  hide_psd: boolean = true;
  toggle_psd(){
    this.hide_psd = !this.hide_psd; 
    if(this.hide_psd == true){
      this.psd_text = 'Show Data'
    }else{
      this.psd_text = 'Hide Data'
    }
  }

  update_tabs(){
    const tabs = d3.select('#tabs');
    if (this.hide_hits == false) {
      tabs.select('#all_screened').classed('active', true);
      tabs.select('#hits_only').classed('active', false);
    }else{
        tabs.select('#all_screened').classed('active', false);
        tabs.select('#hits_only').classed('active', true);
      } 
  }
  

   
  hide_hits: boolean = false;
  view_hits(){
    this.hide_hits = true;
    this.update_tabs()
  }

  view_all(){
    this.hide_hits = false; 
    this.update_tabs()
  }
}
