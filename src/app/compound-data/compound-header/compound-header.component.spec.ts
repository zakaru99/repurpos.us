import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material';
import { of } from 'rxjs';

import { CompoundHeaderComponent } from './compound-header.component';
import { CompoundService } from '../../_services/index';
import { LoginStateService } from '../../_services';
import { FavoritesService } from '../../_services/favorites.service';
import { CompoundListsService } from '../../_services/compound-lists.service';

@Component({ selector: 'app-salt-warning-dialog', template: '' })
class SaltWarningDialogStubComponent {}

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
      imports: [ HttpClientTestingModule, FormsModule, NoopAnimationsModule, MatTooltipModule ],
      declarations: [ CompoundHeaderComponent, SaltWarningDialogStubComponent ],
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
