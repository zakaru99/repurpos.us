import { Component, OnInit, OnChanges, Input } from '@angular/core';

//import { SimilarityData, Compound } from '../../_models/index';
import { CompoundService } from '../../_services/index';
import { Compound } from '../../_models/index';


@Component({
  selector: 'app-similar-compounds',
  templateUrl: './similar-compounds.component.html',
  styleUrls: ['./similar-compounds.component.scss']
})

export class SimilarCompoundsComponent implements OnInit {
  public similarityResults: Array<Compound>;
  @Input() results_per_page: number;

  num_results: number; // current number of results displayed


  readonly Math = Math;

  constructor(private cmpdSvc: CompoundService) {
    this.cmpdSvc.similarState.subscribe((sdata: Compound[]) => {
      this.similarityResults = sdata;
      this.prepSimilarityData();
      // Back to the first page when another compound loads
      if (this.results_per_page) { this.num_results = this.results_per_page; }
    });
  }

  ngOnInit() {
    this.num_results = this.results_per_page;
  }

  ngOnChanges() {
    this.prepSimilarityData();
  }

  prepSimilarityData() {
    if (this.similarityResults) {
      this.similarityResults = this.similarityResults.slice().sort((a: any, b: any) => b.tanimoto - a.tanimoto);
    }
  }

  // Names of the data a similar compound has (assays, clinical, ...)
  dataFor(c: any): string[] {
    return (c.properties || []).filter((p: any) => p.value).map((p: any) => p.name);
  }

  showMore() {
    this.num_results += this.results_per_page;
    // check to make sure haven't hit the end of the results
    this.num_results = Math.min(this.num_results, this.similarityResults.length);
  }

}
