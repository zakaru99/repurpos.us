import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material';
import { of } from 'rxjs';

import { CompoundWikidataComponent } from './compound-wikidata.component';
import { CompoundService } from '../../_services/index';

class CompoundServiceStub {
  idStates = of({ qid: null, id: '' });
  wikiTableState = of([]);
}

describe('CompoundWikidataComponent', () => {
  let component: CompoundWikidataComponent;
  let fixture: ComponentFixture<CompoundWikidataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, NoopAnimationsModule, MatTooltipModule ],
      declarations: [ CompoundWikidataComponent ],
      providers: [
        { provide: CompoundService, useValue: new CompoundServiceStub() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundWikidataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
