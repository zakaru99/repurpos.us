import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatTableModule, MatSortModule, MatPaginatorModule,
  MatButtonToggleModule, MatTooltipModule, MatIconModule
} from '@angular/material';
import { of } from 'rxjs';

import { SearchResultsTableComponent } from './search-results-table.component';
import { BackendSearchService, SearchResultService, TanimotoScaleService } from '../../_services/index';

@Component({ selector: 'app-search-result-similar', template: '' })
class SearchResultSimilarStubComponent {
  @Input() compound_result: any;
  @Input() mobile: any;
}

@Component({ selector: 'app-struct2d', template: '' })
class Struct2dStubComponent {
  @Input() structure: any;
  @Input() smiles: any;
  @Input() struct_type: any;
}

@Component({ selector: 'app-assay-indication', template: '' })
class AssayIndicationStubComponent {
  @Input() assay_name: any;
  @Input() assay_link: any;
  @Input() assay_type: any;
}

describe('SearchResultsTableComponent', () => {
  let component: SearchResultsTableComponent;
  let fixture: ComponentFixture<SearchResultsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatTooltipModule,
        MatIconModule
      ],
      declarations: [
        SearchResultsTableComponent,
        SearchResultSimilarStubComponent,
        Struct2dStubComponent,
        AssayIndicationStubComponent
      ],
      providers: [
        BackendSearchService,
        SearchResultService,
        TanimotoScaleService,
        Title,
        Meta,
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
