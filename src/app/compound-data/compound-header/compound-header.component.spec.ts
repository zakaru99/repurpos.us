import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material';
import { of } from 'rxjs';

import { CompoundHeaderComponent } from './compound-header.component';
import { PageHeaderModule } from '../../_components/page-header/page-header.module';
import { CompoundService } from '../../_services/index';
import { LoginStateService } from '../../_services';
import { FavoritesService } from '../../_services/favorites.service';
import { CompoundListsService } from '../../_services/compound-lists.service';

@Component({ selector: 'app-salt-warning-dialog', template: '' })
class SaltWarningDialogStubComponent {}

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
}

class CompoundServiceStub {
  idSubject = of({});
  nameState = of('');
  rfmState = of('');
  whoState = of('');
  aliasState = of([]);
  chemSourceState = of([]);
  similarState = of([]);
  assaysState = of([]);
  integrityPediatricsState = of(false);
  disclosureDateState = of('');
  smilesState = of('');
  highestPhaseState = of('');
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
      declarations: [ CompoundHeaderComponent, SaltWarningDialogStubComponent, Struct2dStubComponent,
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
});
