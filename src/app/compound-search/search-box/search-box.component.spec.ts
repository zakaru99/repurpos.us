import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTabsModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';

import { SearchBoxComponent } from './search-box.component';
import { BackendSearchService, SearchResultService, StructureService } from '../../_services/index';

@Component({ selector: 'app-text-search', template: '' })
class TextSearchStubComponent {
  @Input() searchQuery: any;
}

@Component({ selector: 'app-structure-search', template: '' })
class StructureSearchStubComponent {}

describe('SearchBoxComponent', () => {
  let component: SearchBoxComponent;
  let fixture: ComponentFixture<SearchBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule, MatTabsModule, NoopAnimationsModule ],
      declarations: [ SearchBoxComponent, TextSearchStubComponent, StructureSearchStubComponent ],
      providers: [
        BackendSearchService,
        SearchResultService,
        StructureService,
        Title,
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
