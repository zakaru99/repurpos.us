import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';

import { CmpdTooltipComponent } from './cmpd-tooltip.component';

@Component({ selector: 'app-struct2d', template: '' })
class Struct2dStubComponent {
  @Input() structure: any;
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
});
