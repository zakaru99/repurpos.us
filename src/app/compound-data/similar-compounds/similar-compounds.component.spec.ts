import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SimilarCompoundsComponent } from './similar-compounds.component';
import { CompoundService, TanimotoScaleService } from '../../_services/index';

@Component({ selector: 'app-struct2d', template: '' })
class Struct2dStubComponent {
  @Input() structure: any;
  @Input() struct_type: any;
}

@Component({ selector: 'app-available-data', template: '' })
class AvailableDataStubComponent {
  @Input() availData: any;
}

class CompoundServiceStub {
  similarState = of([]);
}

describe('SimilarCompoundsComponent', () => {
  let component: SimilarCompoundsComponent;
  let fixture: ComponentFixture<SimilarCompoundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ SimilarCompoundsComponent, Struct2dStubComponent, AvailableDataStubComponent ],
      providers: [
        TanimotoScaleService,
        { provide: CompoundService, useValue: new CompoundServiceStub() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimilarCompoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
