import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material';
import { of } from 'rxjs';

import { CompoundVendorDataComponent } from './compound-vendor-data.component';
import { CompoundService } from '../../_services/index';

@Component({ selector: 'app-clinical-phase', template: '' })
class ClinicalPhaseStubComponent {
  @Input() phase: any;
  @Input() vendorName: any;
}

class CompoundServiceStub {
  vendorState = of([]);
}

describe('CompoundVendorDataComponent', () => {
  let component: CompoundVendorDataComponent;
  let fixture: ComponentFixture<CompoundVendorDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, NoopAnimationsModule, MatTooltipModule ],
      declarations: [ CompoundVendorDataComponent, ClinicalPhaseStubComponent ],
      providers: [
        { provide: CompoundService, useValue: new CompoundServiceStub() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundVendorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
