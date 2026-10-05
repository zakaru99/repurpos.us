import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

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
