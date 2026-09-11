import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule, MatButtonModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { StructureSearchComponent } from './structure-search.component';
import { SearchResultService } from '../../../_services/index';

@Component({ selector: 'app-structure-search-options', template: '' })
class StructureSearchOptionsStubComponent {}

@Component({ selector: 'app-ketcher', template: '' })
class KetcherStubComponent {}

describe('StructureSearchComponent', () => {
  let component: StructureSearchComponent;
  let fixture: ComponentFixture<StructureSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatExpansionModule, MatButtonModule, NoopAnimationsModule ],
      declarations: [ StructureSearchComponent, StructureSearchOptionsStubComponent, KetcherStubComponent ],
      providers: [
        SearchResultService,
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
