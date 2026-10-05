import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AssayPlotsComponent } from './assay-plots.component';
import { StructureSvgService } from '../../_services/structure-svg.service';
import { LoginStateService } from '../../_services/index';

@Component({ selector: 'app-assay-dwnld', template: '' })
class AssayDwnldStubComponent {
  @Input() assay_title: any;
}

@Component({ selector: 'app-assay-type-btn', template: '' })
class AssayTypeBtnStubComponent {}

@Component({ selector: 'app-dot-plot', template: '' })
class DotPlotStubComponent {}

@Component({ selector: 'app-assay-pagination', template: '' })
class AssayPaginationStubComponent {}

describe('AssayPlotsComponent', () => {
  let component: AssayPlotsComponent;
  let fixture: ComponentFixture<AssayPlotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [
        AssayPlotsComponent,
        AssayDwnldStubComponent,
        AssayTypeBtnStubComponent,
        DotPlotStubComponent,
        AssayPaginationStubComponent
      ],
      providers: [
        StructureSvgService,
        LoginStateService,
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayPlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
