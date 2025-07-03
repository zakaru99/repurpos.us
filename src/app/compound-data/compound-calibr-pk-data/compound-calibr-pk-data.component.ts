import { Component, OnInit } from '@angular/core';
import { CalibrPKData } from '../../_models/index';
import { CompoundService } from '../../_services';

@Component({
  selector: 'app-compound-calibr-pk-data',
  templateUrl: './compound-calibr-pk-data.component.html',
  styleUrls: ['./compound-calibr-pk-data.component.scss']
})
export class CompoundCalibrPkDataComponent implements OnInit {

  pkData: Array<CalibrPKData> = [];

  constructor(private cmpdSvc: CompoundService) { }

  ngOnInit() {
        this.cmpdSvc.calibrPKDataState.subscribe((pk: CalibrPKData[]) => {
          this.pkData = pk;
          console.log(this.pkData)
        })
  }

}
