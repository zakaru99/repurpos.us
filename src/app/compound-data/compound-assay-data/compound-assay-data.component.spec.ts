import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CompoundAssayDataComponent } from './compound-assay-data.component';
import { CompoundService, ColorPaletteService, LoginStateService } from '../../_services/index';
import { BackendSearchService } from '../../_services/backendsearch.service';
import { SciItalicizePipe } from '../../_pipes/sci-italicize.pipe';

describe('CompoundAssayDataComponent', () => {
  let component: CompoundAssayDataComponent;
  let fixture: ComponentFixture<CompoundAssayDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ CompoundAssayDataComponent, SciItalicizePipe ],
      providers: [CompoundService, ColorPaletteService, LoginStateService, BackendSearchService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundAssayDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
