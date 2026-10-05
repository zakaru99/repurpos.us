import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CompoundWikidataIdsComponent } from './compound-wikidata-ids.component';
import { CompoundService } from '../../_services/index';

class CompoundServiceStub {
  idStates = of({ qid: null, id: '' });
  smilesSubject = of('');
  chiralityState = of('');
  wikiIDsState = of({ chem: [], ids: [] });
}

describe('CompoundWikidataIdsComponent', () => {
  let component: CompoundWikidataIdsComponent;
  let fixture: ComponentFixture<CompoundWikidataIdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompoundWikidataIdsComponent ],
      providers: [
        { provide: CompoundService, useValue: new CompoundServiceStub() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundWikidataIdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
