import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AssaysComponent } from './assays.component';
import { ColorPaletteService } from '../_services/index';
import { StandardizeAssayTypePipe } from '../_pipes/standardize-assay-type.pipe';
import { SciItalicizePipe } from '../_pipes/sci-italicize.pipe';
import { PageHeaderModule } from '../_components/page-header/page-header.module';

describe('AssaysComponent', () => {
  let component: AssaysComponent;
  let fixture: ComponentFixture<AssaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        PageHeaderModule
      ],
      declarations: [
        AssaysComponent,
        StandardizeAssayTypePipe,
        SciItalicizePipe
      ],
      providers: [
        ColorPaletteService,
        Title,
        Meta,
        StandardizeAssayTypePipe,
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('groups statuses into stages and counts assays with data', () => {
    const svc = TestBed.get(ColorPaletteService) as ColorPaletteService;
    svc.assaysSubject.next({ assayList: [
      { assay_id: 'A1', title: 'One', assay_type: 'Cell based', indication: 'Malaria', status: 'ReFRAME Screen Completed',
        primary_screened: '12000', dr_screened: 40, published: true, summary: '', purpose: '' },
      { assay_id: 'A2', title: 'Two', assay_type: 'Biochemical', indication: 'TB', status: 'HTS Queue',
        primary_screened: '0', dr_screened: 0, published: false, summary: '', purpose: '' },
      { assay_id: 'A3', title: 'Three', assay_type: 'Cell-based', indication: 'TB', status: 'ReFRAME Dose Response Sent',
        primary_screened: 'secondary', dr_screened: 0, published: false, summary: '', purpose: '' }
    ] });

    expect(component.rows.map(r => r.stage)).toEqual(['Completed', 'Pre-screen', 'Screening']);
    expect(component.rows[0].status).toBe('Screen Completed');
    // "Cell based" and "Cell-based" are one type
    expect(component.typeOptions.find(o => o.value === 'cell-based').n).toBe(2);
    // Only real compound counts count as primary data, not "0"
    expect(component.figures.find(f => f.label === 'Primary screen data').n).toBe(1);
    expect(component.figures.find(f => f.label === 'Dose response published').n).toBe(1);

    // A figure filters the cards to the assays it counts
    component.data = 'primary';
    (component as any).apply();
    expect(component.shown.map(r => r.assay.assay_id)).toEqual(['A1']);
  });
});
