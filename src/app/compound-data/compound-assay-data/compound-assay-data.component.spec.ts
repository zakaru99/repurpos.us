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

  it('opens all curves of a row in the viewer and steps through them, wrapping round', () => {
    component.openCurves({ assay_id: 'A1', curve_keys: ['k1', 'k2', 'k3'] } as any);
    expect(component.viewer.index).toBe(0);
    component.step(1);
    expect(component.viewer.keys[component.viewer.index]).toBe('k2');
    component.step(-1);
    component.step(-1);
    expect(component.viewer.keys[component.viewer.index]).toBe('k3');
    component.onViewerKey(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(component.viewer.index).toBe(0);
    component.closeCurve();
    expect(component.viewer).toBeNull();
  });
});
