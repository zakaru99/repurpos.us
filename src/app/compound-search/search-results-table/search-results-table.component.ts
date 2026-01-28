import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { SearchResult, Compound } from '../../_models/index';
import { BackendSearchService, SearchResultService, TanimotoScaleService } from '../../_services/index';

import * as _ from 'lodash';


@Component({
  selector: 'app-search-results-table',
  templateUrl: './search-results-table.component.html',
  styleUrls: ['./search-results-table.component.scss']
})
export class SearchResultsTableComponent implements OnInit {
  private paginator: MatPaginator;

  private sort: MatSort;

  PHASE_ORDER: { [key: string]: number } = {
    "IND Filed": 1,
    "Phase 0": 2,
    "Clinical": 3,
    "Discontinued": 4,
    "Phase I": 5,
    "Phase I/II": 6,
    "Phase II": 7,
    "Phase II/III": 8,
    "Phase III": 9,
    "Pre-Registered": 10,
    "Registered": 11,
    "Withdrawn": 12,
    "Launched": 13
  };

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    // Required for async loading of data, as per https://stackoverflow.com/questions/48943501/angular-mat-table-datasource-paginator-and-datasource-sort-and-datasource-filter
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  matchFilter: string = 'all';

  results: Compound[];
  private resultsSubscription: Subscription;

  responseCode: number; // response coming back from the API query
  APIquery: string;
  queryString: string;
  queryType: string;
  probSMILES: boolean = false;
  displayResults: boolean; // if results are being reset, don't show the results
  isMobile: boolean; // media query for if on small screen

  pageIdx: number = 0; // holder for current page in pagination
  pageSizeVal: number = 25; // holder for current page in pagination
  pageSize: number = this.pageSizeVal; // holder for current page in pagination

  assays: string[];
  max_num_assays: number = 10;
  // minColumns: string[] = ['main_label', 'alias', 'id', 'reframeid']; // minimal set of columns to include
  minColumns: string[] = ['struct', 'main_label', 'highestPhase', 'assays', 'similar']; // minimal set of columns to include
  displayedColumns: string[]; // minimal set of columns to include
  dataSource = new MatTableDataSource<Compound>();

  num_aliases: number = 5; // maximum number of aliases to show at one time

  tanimotoScale: any; // color scale for tanimoto scores
  getFontColor: any; // function to get the font color for a tanimoto score

  tanimotoTooltip: string = "Structural similarity metric, ranging from 0 (no similarity) to 1 (identical atom connectivity)";
  similarTooltip: string = "Structures have a 0.85 or higher Tanimoto similarity score";
  assayTooltip: string = "Assays for which the compound has been measured to be active";
  rfmTooltip: string = "Sample has been purchased or synthesized as part of Reframe library";
  skeletonTooltip: string = "Compound has the same skeletal structure as a compound that has been purchased or synthesized as part of Reframe library";

  // expanded: boolean = false; // trigger to turn table to shortened form.

  statusOrder = {
    'plated': '5',
    'one_off': '4',
    'historical_one_off': '3',
    'on_order': '2',
    'historical': '1',
    'not_in_collection': '0',
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Custom sorting algo to make sure the sorting happens as I expect
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'main_label': return item.main_label.toLowerCase();
        case 'reframeid': return (item.assays + Number(item.reframeid === 'full' || item.reframeid === 'stereofree' || item.reframeid === 'sub_smiles') + Number(item.similar_compounds.length > 0) / 2);
        case 'highestPhase': return this.PHASE_ORDER[item.highest_phase] !== undefined ? this.PHASE_ORDER[item.highest_phase]: -1;
        case 'assays': return (item.assays + Number(item.reframeid === true));
        case 'struct': return (this.statusOrder[item.reframeid]);
        default: return item[property];
      }
    };
  }


  constructor(
    private route: ActivatedRoute,
    private backendSvc: BackendSearchService,
    private searchResultService: SearchResultService,
    private titleService: Title,
    private meta: Meta,
    private tanimotoSvc: TanimotoScaleService,
  ) {
    // media query
    this.checkMobile()

    // make sure search has been executed
    searchResultService.submitAnnounced$.subscribe(
      submitted => {
        this.displayResults = submitted;
      }

    )

    this.route.queryParams.subscribe(params => {
      this.queryString = params.query;
      this.queryType = params.mode ? `${params.mode} ${params.type}` : params.type;
      console.log(params)
    });

    // get search results
    this.resultsSubscription = this.searchResultService.newSearchResult$.subscribe(
      result => {
        console.log(result)
        // reset pagination
        this.pageIdx = 0;
        this.pageSize = this.pageSizeVal;

        this.responseCode = result.status;
        this.APIquery = result.url;
        this.probSMILES = this.queryString.indexOf("(") > -1 || this.queryString.indexOf("=") > -1; // If query fails, see if the query was probably a SMILES input
        // console.log(decodeURIComponent(this.APIquery))

        if (result.data) {
          let results = result.data;
          this.results = Array.isArray(result.data) ? result.data : [result.data];


          // example filtering
          // results = results.filter(d => d.reframeid === true);

          // Calculate the number of assays per hit
          results.forEach((d: any) => {
            d['assay_types'] = d.assay_types.sort((a, b) => a[2] > b[2]);
            d['assays'] = d.assay_types.length;
            d['aliases'] = this.removeDupeAlias(d.aliases);
            d['alias_ct'] = this.num_aliases;
            d['max_aliases'] = false;
            d['expanded'] = false; // trigger to turn table to shortened form.
          });

          console.log(results)
          // Sort results by multiple columns
          // this.dataSource.data = results;
          this.dataSource.data = this.sortResults(results, 'Availability');
          // this.dataSource.data = this.sortResults([{ 'svg': "<?xml version='1.0' encoding='UTF-8'?> <!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'> <svg version='1.2' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='6.45mm' height='5.77mm' viewBox='0 0 6.45 5.77'>   <desc>Generated by the Chemistry Development Kit (http://github.com/cdk)</desc>   <g stroke-linecap='round' stroke-linejoin='round' stroke='#000000' stroke-width='.19'>     <rect x='.0' y='.0' width='7.0' height='6.0' fill='#FFFFFF' stroke='none'/>     <g id='mol1' class='mol'>       <line id='mol1bnd1' class='bond' x1='.69' y1='.69' x2='5.77' y2='.69'/>       <line id='mol1bnd2' class='bond' x1='5.77' y1='.69' x2='3.23' y2='5.09'/>       <line id='mol1bnd3' class='bond' x1='.69' y1='.69' x2='3.23' y2='5.09'/>     </g>   </g> </svg>", 'compound_id': 'id', 'smiles': 'smiles' }]);
          // this.resetSort();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // set title of page
          this.titleService.setTitle("search results | reframeDB");

          this.meta.updateTag({ property: 'og:url', content: window.location.href });
          this.meta.updateTag({property: 'og:title', content: `search results for ${this.queryString} | reframeDB`});
          this.meta.updateTag({property: 'og:description', content: `search results for ${this.queryType} search of ${this.queryString} | reframeDB`});
          this.applyMatchFilter();
        }


      });

    // get tanimoto color function
    this.tanimotoScale = tanimotoSvc.getScale();
    this.getFontColor = tanimotoSvc.getFontColor();

  }
  onMatchFilterChange(event: any) {
    console.log('toggle changed', event);
    this.matchFilter = event.value;
    this.applyMatchFilter();
  }


  applyMatchFilter() {
  if (!this.results) return;

  let filteredCompounds: Compound[] = this.results;

  if (this.matchFilter !== 'all') {
    const filterKeyMap = {
      name: 'name_match',
      target: 'target_match',
      moa: 'moa_match',
      roa: 'roa_match',
      phase: 'phase_match'
    };

    const matchKey = filterKeyMap[this.matchFilter];

    filteredCompounds = this.results.filter(c => {
      const matched = c['matched_queries'] || [];
      return matched.includes(matchKey);
    });
  }

  // update table
  this.dataSource.data = filteredCompounds.slice();
  if (this.paginator) this.paginator.firstPage();

  console.log('filtered compounds:', filteredCompounds.length);
}



  resetSort() {
    if (this.sort) {
      if (this.sort.active) this.sort.active = "";
      this.sort.direction = "";
      this.sort.start = "asc";
      this.sort._stateChanges.next();
    }
  }

  ngOnInit() {
    this.dataSource.data = [];
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    //
    // this.dataSource.sort = this.sort;
    // console.log(this.dataSource)
  }

  ngOnDestroy() {
    this.resultsSubscription.unsubscribe();
  }

  checkMobile() {
    if (window.matchMedia('(max-width: 900px)').matches) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  // sortByHighestPhase() {
  //   if (!this.sort) return;
  
  //   if (this.sort.active === 'highestPhase') {
  //     this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
  //   } else {
  //     this.sort.active = 'highestPhase';
  //     this.sort.direction = 'asc';
  //   }
  
  //   this.sort.sortChange.emit({ active: this.sort.active, direction: this.sort.direction });
  
  //   //Perform the custom sort and update data
  //   const sortedResults = this.sortResults(this.results, 'Phase');
  //   this.dataSource.data = this.sort.direction === 'asc' ? sortedResults : sortedResults.reverse();
  // }

  sortResults(results, sort_on) {
    // apply the sorting function
    // NOTE: Chrome and Firefox --> different sorting results since Chrome sorts by arbitrary values in ties.
    // Solution: sort by TM score, then ES score (rank from search result)
    // https://medium.com/@fsufitch/is-javascript-array-sort-stable-46b90822543f
    let sorted = results;
    
    const statusOrder = {
      'plated': '5',
      'one_off': '4',
      'historical_one_off': '3',
      'on_order': '2',
      'historical': '1',
      'not_in_collection': '0',
    }

    
    if(sort_on == 'Tanimoto'){
      if (results.some(el => el.hasOwnProperty('tanimoto'))) {
        sorted = _.orderBy(results, [function(o) { return o.tanimoto.toFixed(2); }], ['desc'])
      }
    }else if(sort_on == 'Availability'){
      if (results.some(el => el.hasOwnProperty('reframeid'))) {
        sorted = _.orderBy(results, [function(o) { 
          return statusOrder[o.reframeid]; }], ['asc']);
      }
    }
    
    // let sorted = _.orderBy(results, [function(o) { return o.tanimoto.toFixed(2); }, function(o) { return o.search_result_index; }], ['desc', 'desc'])
    // let sorted = _.orderBy(results, [function(o) { return o.tanimoto.toFixed(2); }, function(o) { return o.main_label.toLowerCase(); }], ['desc', 'asc'])

    // Determine which columns to show in table (e.g. +/- Tanimoto score)
    this.getColumns(sorted);
    return (sorted);
  }


  getColor(assays) {
    let min_alpha = 0.15;

    if (assays.length === 0) {
      return 0;
    }
    return ((assays.length - 1) / (this.max_num_assays - 1)) * (1 - min_alpha) + min_alpha;
  }


  getColumns(df: Compound[]) {
    this.displayedColumns = this.minColumns.slice(0); // create shallow copy
    // if tanimoto exists, add it to the displayed properties.
    if (df.some(el => el['tanimoto'] > 0)) {
      this.displayedColumns.push('tanimoto');
    }
    console.log(this.displayedColumns)
  }
  

  // Alias functions
  removeDupeAlias(arr: string[]) {
    let unique_alias: string[] = [];
    let stripped_alias: string[] = [];

    // function to standardize aliases
    let strip_alias = function(str: string) {
      // regex remove (), -'s, case specificity
      let re = /\((.*)\)/;
      return (str.replace('-', '').replace(re, '').trim().toLowerCase())
    }

    let current_alias: string;
    let current_stripped: string;

    for (let i = 0; i < arr.length; i++) {
      current_alias = arr[i];
      current_stripped = strip_alias(current_alias);

      if (!stripped_alias.includes(current_stripped)) {
        unique_alias.push(current_alias);
        stripped_alias.push(current_stripped);
      }
    }

    return (unique_alias);

  }

  onSortChange(event) {
    this.dataSource.data = this.dataSource.sortData(this.dataSource.data, this.dataSource.sort);
    // console.log(this.dataSource.sortData(this.dataSource.data, this.dataSource.sort).map(d=> d.main_label))
  }


  onPageChange(event) {
    this.pageIdx = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  showMore(row_num) {
    let sortedData = this.dataSource.sortData(this.dataSource.data, this.dataSource.sort);

    let idx = row_num + this.pageIdx * this.pageSize;
    if (sortedData[idx]['max_aliases']) {
      sortedData[idx]['alias_ct'] = this.num_aliases;
    } else {
      sortedData[idx]['alias_ct'] = sortedData[idx].aliases.length;
    }

    sortedData[idx]['max_aliases'] = !sortedData[idx]['max_aliases'];

    // sortedData[row_num + this.pageIdx * this.pageSize]['alias_ct'] += this.num_aliases; // incremement
    this.dataSource.data = sortedData;
    // this.dataSource.data[row_num + this.pageIdx * this.pageSize]['alias_ct'] += this.num_aliases;
  }

  expandCell(row_num) {
    let sortedData = this.dataSource.sortData(this.dataSource.data, this.dataSource.sort);

    let idx = row_num + this.pageIdx * this.pageSize;
    sortedData[idx]['expanded'] = !sortedData[idx]['expanded'];

    this.dataSource.data = sortedData;
  }

  dwnldSearch(){
    if (this.dataSource.data.length >=1){
      this.processDownload();
    }else{
      alert('There are no search results to download');
      return false;
    }
  }

  
  downloadSDF(): void {
  if (!this.dataSource.data || this.dataSource.data.length === 0) {
    alert('There are no search results to download');
    return;
  }

  let sdfContent = '';

  // SDF template for each compound
  this.dataSource.data.slice(0, 100).forEach(c => {
    const name = c.main_label || 'Unknown';
    const smiles = c.smiles || '';

    // Basic SDF header (V2000 stub – no atom/bond block, but still readable)
    sdfContent += `${name}
  REFRAMEDB  GENERATED

  >  <SMILES>
  ${smiles}

  >  <ID>
  ${c.id}

  >  <LINK>
  https://reframedb.org/compound_data/${c.id}?qid=${c.qid}

  $$$$
  `;
    });

    const blob = new Blob([sdfContent], {
      type: 'chemical/x-mdl-sdfile'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `reframedb_search_${this.queryString}.sdf`;
    link.click();

    window.URL.revokeObjectURL(url);
  }


  processDownload(){
    const lineDelimiter = '\n';
    const columnDelimiter = ','; //using comma to format data for csv

    const colNames = ['name', 'ikey', 'smile', 'collection status', 'link']
    var dwnld_data = '';
    //build the header row
    dwnld_data += colNames.join(columnDelimiter);
    dwnld_data += lineDelimiter;

    const statusMap = {
      'plated': 'screening collection compound',
      'one_off': 'not plated, but available for one-off testing',
      'historical_one_off': 'Historical screening collection compound, available for one-off testing',
      'historical': 'screening collection compound (historical)',
      'on_order': 'compound is on order to include in the screening collection',
      'not_in_collection': 'not in screening collection',
    }

    // Create a mapping of status descriptions to indices manually
    const statusOrder = {};
    Object.keys(statusMap).forEach((key, index) => {
      statusOrder[statusMap[key]] = index;
    });

    // Create a new sorted array based on the statuses
    const sortedData = this.dataSource.data.slice().sort((a, b) => {
      const statusA = statusMap[a['reframeid']] || '';
      const statusB = statusMap[b['reframeid']] || '';
      
      const rankA = statusOrder[statusA] !== undefined ? statusOrder[statusA] : Infinity;
      const rankB = statusOrder[statusB] !== undefined ? statusOrder[statusB] : Infinity;
    
      return rankA - rankB;
    });

    sortedData.slice(0, 100).forEach( function(item){
      console.log(item)
      
      let tmp = {
        'name': item['main_label'],
        'ikey': item['id'],
        'smile': item['smiles'],
        'collection status': statusMap[item['reframeid']] || 'not in screening collection',
        'link': `=HYPERLINK("https://reframedb.org/compound_data/${item.id}?qid=${item.qid}")`
      };

      let counter = 0;
      colNames.forEach( function(key){
        if (counter > 0) dwnld_data += columnDelimiter;
        // enquote all data, to deal with commas in data
        dwnld_data += '"';
        dwnld_data += (tmp[key]|| "").replace(/"/g, '""');
        dwnld_data += '"';
        counter++;
      })
      dwnld_data += lineDelimiter
    })
    save_data(dwnld_data, '.csv', this.queryString)
  }
}

function save_data(dwnld_data, file_type, terms){
  var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/tsv;charset=utf-8,' + encodeURIComponent(dwnld_data);
    hiddenElement.target = '_blank';
    hiddenElement.download = `reframe search ${terms}.${file_type}`;
    document.body.appendChild(hiddenElement);
    hiddenElement.click();
}
