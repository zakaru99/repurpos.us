import { Component, OnInit, Input } from '@angular/core';
import { AssayData } from '../../_models/index';
import { CompoundService, ColorPaletteService } from '../../_services/index';

@Component({
  selector: 'app-compound-assay-data',
  templateUrl: './compound-assay-data.component.html',
  styleUrls: ['./compound-assay-data.component.scss']
})
 
export class CompoundAssayDataComponent implements OnInit {
  assayData: Array<AssayData> = [];
  assayMin: number;

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Toggle activity
  activity_text = 'Show Data';
  hide_activity: boolean = true;

  displayedColumns: string[] = [
    'id',
    'title',
    'indication',
    'activityType',
    'measurement',
    'source',
    'vendor',
    'vendorId'
  ];

  constructor(private cmpdSvc: CompoundService, public colorSvc: ColorPaletteService) {
    this.cmpdSvc.assaysState.subscribe((assays: AssayData[]) => {
      this.assayData = assays;
      this.assayMin = Math.min(...assays.filter(d => d.ac50).map((d: any) => d.ac50));
    });
  }

  ngOnInit() {}

  toggle_activity_data() {
    this.hide_activity = !this.hide_activity;
    this.activity_text = this.hide_activity ? 'Show Data' : 'Hide Data';
  }

  // Sorting function
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.assayData.sort((a: any, b: any) => {
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
}
