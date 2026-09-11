import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CompoundOntologyDataComponent } from './compound-ontology-data.component';
import { CompoundService } from '../../_services/index';

class CompoundServiceStub {
  vendorState = of([]);
}

describe('CompoundOntologyDataComponent', () => {
  let component: CompoundOntologyDataComponent;
  let fixture: ComponentFixture<CompoundOntologyDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompoundOntologyDataComponent ],
      providers: [
        { provide: CompoundService, useValue: new CompoundServiceStub() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundOntologyDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
