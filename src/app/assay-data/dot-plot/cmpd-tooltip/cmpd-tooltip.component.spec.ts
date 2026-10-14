import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { CmpdTooltipComponent } from './cmpd-tooltip.component';

@Component({ selector: 'app-struct2d', template: '' })
class Struct2dStubComponent {
  @Input() structure: any;
  @Input() struct_type: any;
  @Input() launch_search: any;
}

describe('CmpdTooltipComponent', () => {
  let component: CmpdTooltipComponent;
  let fixture: ComponentFixture<CmpdTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmpdTooltipComponent, Struct2dStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmpdTooltipComponent);
    component = fixture.componentInstance;
    component.dataObj = { on: false };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows concentrations in nM or µM and keeps a shared qualifier', () => {
    expect(component.conc(4.2e-7)).toBe('420 nM');
    expect(component.conc(3.1e-6)).toBe('3.1 µM');
    component.data = { value: { ac_precision: ['>', '>'], assay_type: 'EC50' } };
    expect(component.precisionFor(-1)).toBe('> ');
    expect(component.typeLabel).toBe('EC₅₀');
  });
});
