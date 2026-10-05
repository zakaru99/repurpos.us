import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssayPaginationComponent } from './assay-pagination.component';
import { StructureSvgService } from '../../_services/structure-svg.service';

describe('AssayPaginationComponent', () => {
  let component: AssayPaginationComponent;
  let fixture: ComponentFixture<AssayPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ AssayPaginationComponent ],
      providers: [StructureSvgService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
