import { Component, OnInit, Input, HostListener } from '@angular/core';
import { AssayData } from '../../_models/index';
import { CompoundService, ColorPaletteService } from '../../_services/index';
import { environment } from '../../../environments/environment';

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

  // Dose-response curve images, served by the backend from the ACAS uploads S3 bucket
  curveUrlBase = environment.api_url + '/curve_image?key=';
  enlargedCurve: string = null;

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

  curveUrl(key: string): string {
    return this.curveUrlBase + encodeURIComponent(key);
  }

  openCurve(key: string) {
    this.enlargedCurve = this.curveUrl(key);
  }

  @HostListener('document:keydown.escape')
  closeCurve() {
    this.enlargedCurve = null;
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
