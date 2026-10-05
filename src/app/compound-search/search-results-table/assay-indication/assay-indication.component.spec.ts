import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AssayIndicationComponent } from './assay-indication.component';
import { ColorPaletteService } from '../../../_services/color-palette.service';
import { SciItalicizePipe } from '../../../_pipes/sci-italicize.pipe';

describe('AssayIndicationComponent', () => {
  let component: AssayIndicationComponent;
  let fixture: ComponentFixture<AssayIndicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ AssayIndicationComponent, SciItalicizePipe ],
      providers: [ ColorPaletteService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayIndicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
