import { Component, OnInit } from '@angular/core';

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

}
