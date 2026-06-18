import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { CompoundService } from '../../_services/index';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { LoginStateService } from '../../_services';
import { FavoritesService } from '../../_services/favorites.service';
import { CompoundListsService, CompoundList } from '../../_services/compound-lists.service';

import { AssayData, Compound } from '../../_models';
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

  public isToxicA00295 = false;
  public hasA00295Data = false;
  public isToxicA00296 = false;
  public hasA00296Data = false;
  public assayData: AssayData[] = [];

  public integrityPediatrics: boolean = false;
  public disclosureDate: string = '';

  num_aliases: number;
  all_shown: boolean = false;
  alias_ct: number;

  compoundId: string = '';
  compoundName: string = '';
  loggedIn: boolean = false;
  lists: CompoundList[] = [];
  showListDropdown: boolean = false;
  newListName: string = '';
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any = null;

  constructor(
    private cmpdSvc: CompoundService,
    private loginStateService: LoginStateService,
    public favoritesService: FavoritesService,
    public listsService: CompoundListsService
  ) {
    this.getNumAliases();

    this.cmpdSvc.idSubject.subscribe((idData: any) => {
      this.compoundId = idData && idData.id ? idData.id : '';
    });

    this.cmpdSvc.nameState.subscribe(cmpdName => {
      this.label = cmpdName;
      this.compoundName = cmpdName || '';
    });

    this.cmpdSvc.rfmState.subscribe((rfm: string) => {
      this.reframeCmpd = rfm;
    });

    this.cmpdSvc.whoState.subscribe((who: string) => {
      this.whoName = who;
    });

    this.cmpdSvc.aliasState.subscribe((aliasList: string[]) => {
      this.aliases = aliasList;
    });

    this.cmpdSvc.chemSourceState.subscribe((sources: Object[]) => {
      this.chemVendors = sources;
    });

    this.cmpdSvc.similarState.subscribe((sdata: Compound[]) => {
      this.similarityResults = sdata;
    });

    this.cmpdSvc.assaysState.subscribe((assays: AssayData[]) => {
      this.assayData = assays;
      this.checkToxicity();
    });

    this.cmpdSvc.integrityPediatricsState.subscribe((integrityPediatrics: boolean) => {
      this.integrityPediatrics = integrityPediatrics;
    });

    this.cmpdSvc.disclosureDateState.subscribe((disclosureDate: string) => {
      this.disclosureDate = disclosureDate;
    });

    loginStateService.isUserLoggedIn.subscribe(state => {
      this.loggedIn = state.loggedIn;
    });

    listsService.lists$.subscribe(lists => {
      this.lists = lists;
    });
  }

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.compoundId);
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimer) { clearTimeout(this.toastTimer); }
    this.toastMessage = '';
    setTimeout(() => {
      this.toastMessage = msg;
      this.toastType = type;
      this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 3000);
    }, 10);
  }

  toggleFavorite(): void {
    const wasFavorite = this.isFavorite;
    this.favoritesService.toggle(this.compoundId, this.compoundName);
    this.showToast(wasFavorite ? 'Removed from favorites' : 'Saved to favorites');
  }

  addToList(listId: number): void {
    const list = this.lists.find(l => l.id === listId);
    this.listsService.addToList(listId, this.compoundId, this.compoundName).subscribe();
    this.showListDropdown = false;
    this.showToast('Added to ' + (list ? '"' + list.name + '"' : 'list'));
  }

  createAndAddList(): void {
    const name = this.newListName.trim();
    if (!name) { return; }
    this.newListName = '';
    this.showListDropdown = false;
    this.listsService.createList(name).subscribe((res: any) => {
      if (res && res.id) {
        this.listsService.addToList(res.id, this.compoundId, this.compoundName).subscribe();
        this.showToast('Added to "' + name + '"');
      } else {
        this.showToast('Created "' + name + '" — add compound from My Lists', 'success');
      }
    });
  }

  checkToxicity(): void {
    if (!this.assayData || this.assayData.length === 0) {
      this.isToxicA00295 = false;
      this.hasA00295Data = false;
      this.isToxicA00296 = false;
      this.hasA00296Data = false;
      return;
    }

    const a00295Assays = this.assayData.filter(x =>
      x.assay_id === 'A00295' &&
      x.activity_type &&
      x.activity_type.toUpperCase() === 'IC50' &&
      !isNaN(Number(x.ac50))
    );

    this.hasA00295Data = a00295Assays.length > 0;
    this.isToxicA00295 = a00295Assays.some(x => Number(x.ac50) < 1e-5);

    const a00296Assays = this.assayData.filter(x =>
      x.assay_id === 'A00296' &&
      x.activity_type &&
      x.activity_type.toUpperCase() === 'IC50' &&
      !isNaN(Number(x.ac50))
    );

    this.hasA00296Data = a00296Assays.length > 0;
    this.isToxicA00296 = a00296Assays.some(x => Number(x.ac50) < 1e-5);
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
    this.checkToxicity();
  }

  get reframeStatus(): { key: string; label: string; tooltip: string } {
    const map: Record<string, { key: string; label: string; tooltip: string }> = {
      plated:             { key: 'plated',             label: 'reframedb collection',          tooltip: 'This compound is included in the reframe screening collection' },
      one_off:            { key: 'one_off',            label: 'available for one-off testing', tooltip: 'This compound is not included in the reframe screening collection, but is available for one-off testing' },
      historical:         { key: 'historical',         label: 'historical',                    tooltip: 'This compound is no longer included in the reframe screening collection' },
      historical_one_off: { key: 'historical_one_off', label: 'historical, one-off available', tooltip: 'This compound is no longer included in the reframe screening collection, but is available for one-off testing' },
      on_order:           { key: 'on_order',           label: 'on order',                      tooltip: 'This compound is on order and will be included in the reframe screening collection soon' },
    };
    return map[this.reframeCmpd] || { key: 'not', label: 'not in collection', tooltip: 'This compound is not included in the reframe screening collection' };
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

  clickedQC(vendor_ikey) {
    function saveAs(uri, filename) {
      var link = document.createElement('a');
      if (typeof link.download === 'string') {
        document.body.appendChild(link);
        link.download = filename;
        link.href = uri;
        link.click();
        document.body.removeChild(link);
      } else {
        location.replace(uri);
      }
    }

    $.ajax({
      type: "POST",
      async: false,
      url: "https://reframedb.org/php/getQCdownloadID.php",
      data: {ikey: vendor_ikey},
      dataType: 'JSON',
      success: function(response) {
        var fileData = response.data;
        if (fileData !== undefined) {
          for (var i = 0; i < fileData.length; i++) {
            console.log(fileData[i]);
            var filepath = '../../assets/QC_files/' + fileData[i].upload_id + fileData[i].extension;
            if (fileData[i].extension == '.pdf') {
              var file_name = fileData[i].file_name.split('.')[0];
            } else {
              var file_name = fileData[i].file_name;
            }
            saveAs(filepath, file_name);
          }
        } else {
          alert("sorry, QC data for this compound is not yet available");
        }
      }
    });
  }
}
