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

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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

  // Sorting function
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.primaryData.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];

      // Handle numbers
      if (!isNaN(valA) && !isNaN(valB)) {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // Handle strings
      valA = valA ? valA.toString().toLowerCase() : '';
      valB = valB ? valB.toString().toLowerCase() : '';
      return this.sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
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
