import { Component, Input, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HomeDataService, HomeCompound, HomeAssay } from '../home-data.service';

type TabId = 'compound' | 'screens' | 'structure' | 'mechanism';

// "Explore the data": one tab per way into the site, each with a small live
// preview built from real (public) data rather than a screenshot.
@Component({
  selector: 'app-explore-tabs',
  templateUrl: './explore-tabs.component.html',
  styleUrls: ['./explore-tabs.component.scss']
})
export class ExploreTabsComponent implements OnInit {
  @Input() moaCategories: Array<{ label: string; value: number }> = [];
  @Input() ontologies: Array<{ label: string; value: number }> = [];

  // Imatinib: a well-annotated example with many screens and close analogues
  readonly example = { id: 'KTUFNOKKBVMGRW', qid: 'Q82870894' };

  tabs: Array<{ id: TabId; title: string; blurb: string }> = [
    { id: 'compound', title: 'Compound profiles', blurb: 'Structure, development status, vendors, PK and every screen a drug appears in.' },
    { id: 'screens', title: 'Screening results', blurb: 'Published assays and the compounds that responded, with dose-response data where measured.' },
    { id: 'structure', title: 'Structure search', blurb: 'Draw or paste a structure to find close analogues in the collection.' },
    { id: 'mechanism', title: 'Mechanism of action', blurb: 'Browse compounds by pharmacological role, target and interaction type.' }
  ];
  active: TabId = 'compound';

  compound$: Observable<HomeCompound>;
  structure$: Observable<SafeUrl>;
  latestAssays$: Observable<HomeAssay[]>;

  constructor(private data: HomeDataService) { }

  ngOnInit() {
    this.compound$ = this.data.getCompound(this.example.id, this.example.qid);
    this.structure$ = this.data.getStructure('Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc1nccc(-c2cccnc2)n1');
    this.select(this.active);
  }

  select(id: TabId) {
    this.active = id;
    // The assay list is large; only fetch it once the tab is opened
    if (id === 'screens' && !this.latestAssays$) {
      this.latestAssays$ = this.data.getPublishedAssays().pipe(map(list => list.slice(0, 5)));
    }
  }

  onTabKey(event: KeyboardEvent, i: number) {
    const keys: { [key: string]: number } = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    const step = keys[event.key];
    if (!step) { return; }
    event.preventDefault();
    const next = (i + step + this.tabs.length) % this.tabs.length;
    this.select(this.tabs[next].id);
    const el = document.getElementById('explore-tab-' + this.tabs[next].id);
    if (el) { el.focus(); }
  }

  get maxMoa(): number {
    return Math.max(1, ...this.moaCategories.map(c => c.value));
  }

  get maxOntology(): number {
    return Math.max(1, ...this.ontologies.map(c => c.value));
  }
}
