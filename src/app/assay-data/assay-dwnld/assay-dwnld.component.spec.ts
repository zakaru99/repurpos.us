import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModule, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

import { AssayDwnldComponent } from './assay-dwnld.component';
import { StructureSvgService } from '../../_services/structure-svg.service';

describe('AssayDwnldComponent', () => {
  let component: AssayDwnldComponent;
  let fixture: ComponentFixture<AssayDwnldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgbModule],
      declarations: [ AssayDwnldComponent ],
      providers: [DatePipe, StructureSvgService, NgbDropdownConfig]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayDwnldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
