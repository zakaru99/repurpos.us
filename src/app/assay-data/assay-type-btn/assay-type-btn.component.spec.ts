import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssayTypeBtnComponent } from './assay-type-btn.component';
import { StructureSvgService } from '../../_services/structure-svg.service';

describe('AssayTypeBtnComponent', () => {
  let component: AssayTypeBtnComponent;
  let fixture: ComponentFixture<AssayTypeBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ AssayTypeBtnComponent ],
      providers: [StructureSvgService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayTypeBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
