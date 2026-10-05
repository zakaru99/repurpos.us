import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { of } from 'rxjs';

import { CompoundDataComponent } from './compound-data.component';
import { WDQService, LoginStateService } from '../_services/index';
import { BackendSearchService } from '../_services/backendsearch.service';

@Component({ selector: 'app-compound-header', template: '' })
class CompoundHeaderStubComponent {
  @Input() results_per_page: any;
  @Input() _location: any;
}

@Component({ selector: 'app-struct2d', template: '' })
class Struct2dStubComponent {
  @Input() structure: any;
  @Input() smiles: any;
}

@Component({ selector: 'app-compound-wikidata-ids', template: '' })
class CompoundWikidataIdsStubComponent {}

@Component({ selector: 'app-compound-calibr-pk-data', template: '' })
class CompoundCalibrPkDataStubComponent {}

@Component({ selector: 'app-compound-ontology-data', template: '' })
class CompoundOntologyDataStubComponent {}

@Component({ selector: 'app-compound-wikidata', template: '' })
class CompoundWikidataStubComponent {}

@Component({ selector: 'app-compound-vendor-data', template: '' })
class CompoundVendorDataStubComponent {}

@Component({ selector: 'app-compound-assay-data', template: '' })
class CompoundAssayDataStubComponent {}

@Component({ selector: 'app-primary-screening-data', template: '' })
class PrimaryScreeningDataStubComponent {}

@Component({ selector: 'app-compound-synthetic-route', template: '' })
class CompoundSyntheticRouteStubComponent {}

@Component({ selector: 'app-available-data', template: '' })
class AvailableDataStubComponent {
  @Input() availData: any;
}

@Component({ selector: 'app-similar-compounds', template: '' })
class SimilarCompoundsStubComponent {
  @Input() results_per_page: any;
}

describe('CompoundDataComponent', () => {
  let component: CompoundDataComponent;
  let fixture: ComponentFixture<CompoundDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [
        CompoundDataComponent,
        CompoundHeaderStubComponent,
        Struct2dStubComponent,
        CompoundWikidataIdsStubComponent,
        CompoundCalibrPkDataStubComponent,
        CompoundOntologyDataStubComponent,
        CompoundWikidataStubComponent,
        CompoundVendorDataStubComponent,
        CompoundAssayDataStubComponent,
        PrimaryScreeningDataStubComponent,
        CompoundSyntheticRouteStubComponent,
        AvailableDataStubComponent,
        SimilarCompoundsStubComponent
      ],
      providers: [
        Title,
        Meta,
        LoginStateService,
        BackendSearchService,
        WDQService,
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
