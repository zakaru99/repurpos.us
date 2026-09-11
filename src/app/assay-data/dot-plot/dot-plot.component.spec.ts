import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DotPlotComponent } from './dot-plot.component';
import { StructureSvgService } from '../../_services/structure-svg.service';

@Component({ selector: 'app-cmpd-tooltip', template: '' })
class CmpdTooltipStubComponent {
  @Input() dataObj: any;
}

describe('DotPlotComponent', () => {
  let component: DotPlotComponent;
  let fixture: ComponentFixture<DotPlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ DotPlotComponent, CmpdTooltipStubComponent ],
      providers: [StructureSvgService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DotPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
