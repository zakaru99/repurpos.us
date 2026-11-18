import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginStateService, StructureService, SearchResultService } from '../_services/index';

import { CompoundSearchComponent } from './compound-search.component';

@Component({ selector: 'search-box', template: '' })
class SearchBoxStubComponent {}

@Component({ selector: 'search-result', template: '' })
class SearchResultStubComponent {}

describe('CompoundSearchComponent', () => {
  let component: CompoundSearchComponent;
  let fixture: ComponentFixture<CompoundSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      providers: [ LoginStateService, StructureService, SearchResultService ],
      declarations: [ CompoundSearchComponent, SearchBoxStubComponent, SearchResultStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
