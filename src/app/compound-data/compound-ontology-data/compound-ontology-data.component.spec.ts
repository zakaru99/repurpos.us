import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoundOntologyDataComponent } from './compound-ontology-data.component';

describe('CompoundOntologyDataComponent', () => {
  let component: CompoundOntologyDataComponent;
  let fixture: ComponentFixture<CompoundVendorDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompoundOntologyDataComponent ]
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
