import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material';
import { of, BehaviorSubject } from 'rxjs';

import { CompoundHeaderComponent } from './compound-header.component';
import { PageHeaderModule } from '../../_components/page-header/page-header.module';
import { CompoundService } from '../../_services/index';
import { LoginStateService } from '../../_services';
import { FavoritesService } from '../../_services/favorites.service';
import { CompoundListsService } from '../../_services/compound-lists.service';


@Component({ selector: 'app-compound-assay-data', template: '' })
class AssayDataStubComponent {}

@Component({ selector: 'app-primary-screening-data', template: '' })
class PrimaryScreeningStubComponent {}

@Component({ selector: 'app-compound-calibr-pk-data', template: '' })
class CalibrPkStubComponent {}

@Component({ selector: 'app-compound-wikidata', template: '' })
class WikidataStubComponent {}

@Component({ selector: 'app-compound-synthetic-route', template: '' })
class SyntheticRouteStubComponent {}

@Component({ selector: 'app-struct2d', template: '' })
class Struct2dStubComponent {
  @Input() structure: any;
  @Input() smiles: any;
  @Input() struct_type: any;
  @Input() launch_search: boolean;
  @Input() downloadable: boolean;
  @Input() name: string;
}

class CompoundServiceStub {
  idSubject = of({});
  nameState = of('');
  rfmState = of('');
  whoState = of('');
  aliasState = of([]);
  chemSourceState = new BehaviorSubject<any[]>([]);
  similarState = of([]);
  assaysState = of([]);
  integrityPediatricsState = of(false);
  disclosureDateState = of('');
  smilesState = of('');
  highestPhaseState = new BehaviorSubject<any>('');
  primaryDataState = of([]);
  calibrPKDataState = of([]);
  recordLoadedState = new BehaviorSubject<boolean>(false);
  idStates = of({});
  chiralityState = of('');
  wikiIDsState = of({ chem: [], ids: [] });
  vendorState = of([[{}], [{}], [{}], [{}]]);
}

class FavoritesServiceStub {
  isFavorite(compoundId: string): boolean { return false; }
  toggle(compoundId: string, label?: string): void {}
}

class CompoundListsServiceStub {
  lists$ = of([]);
  addToList(listId: number, compoundId: string, label?: string) { return of({}); }
  createList(name: string) { return of({ id: 1 }); }
}

describe('CompoundHeaderComponent', () => {
  let component: CompoundHeaderComponent;
  let fixture: ComponentFixture<CompoundHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, FormsModule, NoopAnimationsModule, MatTooltipModule,
        RouterTestingModule, PageHeaderModule ],
      declarations: [ CompoundHeaderComponent, Struct2dStubComponent,
        WikidataStubComponent, SyntheticRouteStubComponent, AssayDataStubComponent, PrimaryScreeningStubComponent, CalibrPkStubComponent ],
      providers: [
        { provide: CompoundService, useValue: new CompoundServiceStub() },
        LoginStateService,
        { provide: FavoritesService, useValue: new FavoritesServiceStub() },
        { provide: CompoundListsService, useValue: new CompoundListsServiceStub() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists each alias once, ignoring case and the compound name, four before more', () => {
    component.label = 'Imatinib';
    component.aliases = ['Gleevec', 'GLEEVEC', 'Glivec', 'imatinib', 'IMATINIB', 'Imatinib mesilate', 'STI-571', 'CGP-57148B'];
    expect(component.distinctAliases).toEqual(['Gleevec', 'Glivec', 'Imatinib mesilate', 'STI-571', 'CGP-57148B']);
    expect(component.shownAliases.length).toBe(4);
    component.showAllAliases = true;
    expect(component.shownAliases.length).toBe(5);
  });

  it('shows a dash for highest phase when the API sends an empty list', () => {
    const svc = TestBed.get(CompoundService);
    svc.highestPhaseState.next([]);
    expect(component.highestPhase).toBe('');
    svc.highestPhaseState.next(['Launched']);
    expect(component.highestPhase).toBe('Launched');
  });

  it('says there are no screening results only once the record has loaded empty, when signed in', () => {
    const svc = TestBed.get(CompoundService);
    component.loggedIn = true;
    expect(component.noScreeningData).toBe(false);   // still loading
    svc.recordLoadedState.next(true);
    expect(component.noScreeningData).toBe(true);
    component.loggedIn = false;
    expect(component.noScreeningData).toBe(false);   // signed out gets the sign-in prompt instead
  });

  it('shows the QC verdict for the vendor compound the download uses', () => {
    const svc = TestBed.get(CompoundService);
    const http: HttpTestingController = TestBed.get(HttpTestingController);
    svc.chemSourceState.next([{ chem_vendor: 'Calibr', chem_vendor_ikey: 'KTDZCOWXCWUPEO' }]);
    const req = http.expectOne(r => r.url === '/api/qc_summary');
    expect(req.request.params.get('ikey')).toBe('KTDZCOWXCWUPEO');
    expect(req.request.headers.has('Authorization')).toBe(false);   // public, no token
    req.flush({ status: 'success', data: [{ type: 'LCMS', status: 'pass' }, { type: 'NMR', status: 'review' }] });
    expect(component.qcSummaryText).toBe('LCMS Pass · NMR Needs review');

    // a different compound clears the old verdict and asks again
    svc.chemSourceState.next([{ chem_vendor: 'Calibr', chem_vendor_ikey: 'AAAQFGUYHFJNHI' }]);
    expect(component.qcSummaryText).toBe('');
    http.expectOne(r => r.url === '/api/qc_summary').flush({ status: 'success', data: [{ type: 'LCMS', status: 'fail' }] });
    expect(component.qcSummaryText).toBe('LCMS Fail');
    http.verify();
  });
});
