import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { of } from 'rxjs';

import { SearchResultsTableComponent } from './search-results-table.component';
import { SearchResultService } from '../../_services/index';
import { SciItalicizePipe } from '../../_pipes/sci-italicize.pipe';

@Component({ selector: 'app-struct2d', template: '' })
class Struct2dStubComponent {
  @Input() structure: any;
  @Input() smiles: any;
  @Input() struct_type: any;
  @Input() launch_search: any;
}

describe('SearchResultsTableComponent', () => {
  let component: SearchResultsTableComponent;
  let fixture: ComponentFixture<SearchResultsTableComponent>;
  let svc: SearchResultService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule],
      declarations: [SearchResultsTableComponent, Struct2dStubComponent, SciItalicizePipe],
      providers: [
        SearchResultService,
        Title,
        Meta,
        { provide: ActivatedRoute, useValue: { queryParams: of({ query: 'kinase', type: 'string' }) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    svc = TestBed.get(SearchResultService);
    fixture = TestBed.createComponent(SearchResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const compound = (label: string, reframeid: string, phase: string, matched: string[], assays = 0) => ({
    id: 'http://x/' + label.toUpperCase(), qid: 'http://wd/Q1', main_label: label, aliases: [label + '-1', label.toUpperCase() + '-1'],
    smiles: 'C', reframeid, highest_phase: phase, matched_queries: matched, tanimoto: 0, similar_compounds: [],
    assay_types: Array.from({ length: assays }, (_, i) => ['Assay ' + i, 'A0000' + i, 'X'])
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sorts by availability, then filters by match and sample', () => {
    svc.announceNewSearchResult({ data: [
      compound('zeta', 'not_in_collection', 'Phase I', ['moa_match']),
      compound('alpha', 'plated', 'Launched', ['name_match', 'moa_match'], 4),
      compound('beta', 'on_order', 'Phase III', ['moa_match'])
    ] } as any);

    expect(component.sorted.map(r => r.c.main_label)).toEqual(['alpha', 'beta', 'zeta']);
    // Aliases that differ only by case/hyphen collapse to one
    expect(component.rows[0].aliases.length).toBe(1);
    expect(component.matchCount('name')).toBe(1);
    expect(component.availCount('sample')).toBe(1);

    component.setAvailability('none');
    expect(component.filtered.map(r => r.c.main_label)).toEqual(['zeta', 'beta']);

    component.setAvailability('all');
    component.setSort('phase');
    expect(component.sorted[0].c.main_label).toBe('alpha');
  });

  it('lists similar library compounds, most similar first, naming unnamed ones', () => {
    const c: any = compound('gamma', 'not_in_collection', 'Phase I', ['moa_match']);
    c.similar_compounds = [
      { compound_id: 'http://x/AAAA', qid: '', main_label: 'lower', score: 0.86 },
      { compound_id: 'http://x/SLCFEJAMCRLYRG', qid: '', main_label: 'SLCFEJAMCRLYRG', score: 0.91 }
    ];
    svc.announceNewSearchResult({ data: [c] } as any);
    const sim = component.rows[0].similar;
    expect(sim.map(s => s.score)).toEqual([0.91, 0.86]);
    expect(sim[0].named).toBe(false);
    expect(sim[1].named).toBe(true);
    // No name: the InChIKey stands in
    expect(component.similarName(sim[0])).toBe('SLCFEJAMCRLYRG');
  });

  it('shows an error state when the search fails', () => {
    svc.announceNewSearchResult({ data: null, status: 500 } as any);
    expect(component.status).toBe('error');
  });
});
