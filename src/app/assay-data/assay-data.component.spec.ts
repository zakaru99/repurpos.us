import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { of } from 'rxjs';

import { AssayDataComponent } from './assay-data.component';
import { SciItalicizePipe } from '../_pipes/sci-italicize.pipe';
import { EmbedDatasetMetadataDirective } from '../_services/embed-dataset-metadata.directive';
import { ColorPaletteService, LoginStateService, StructureSvgService } from '../_services';
import { PageHeaderModule } from '../_components/page-header/page-header.module';

@Component({ selector: 'app-assay-plots', template: '' })
class AssayPlotsStubComponent {
  @Input() aid: any;
  @Input() assay_title: any;
}

describe('AssayDataComponent', () => {
  let component: AssayDataComponent;
  let fixture: ComponentFixture<AssayDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, PageHeaderModule],
      declarations: [
        AssayDataComponent,
        SciItalicizePipe,
        EmbedDatasetMetadataDirective,
        AssayPlotsStubComponent
      ],
      providers: [
        Title,
        Meta,
        ColorPaletteService,
        LoginStateService,
        StructureSvgService,
        { provide: ActivatedRoute, useValue: { params: of({ aid: 'A00001' }) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.aid).toBe('A00001');
  });

  it('cleans the concentration and reads the primary screen count', () => {
    component.assayDetails = { drug_conc: '10  �M', primary_screened: '25819' } as any;
    expect(component.concentration).toBe('10 µM');
    expect(component.primaryCount).toBe(25819);
    component.assayDetails = { assay_id: 'A00330', primary_screened: 'secondary', summary: 'Secondary assay for A00440. More text.' } as any;
    expect(component.primaryCount).toBeNull();
    expect(component.primaryNote).toBe('Secondary assay');
    expect(component.primaryAssay).toBe('A00440');
  });

  it('splits the contact email out of the authors for the header', () => {
    component.assayDetails = { authors: 'A. Person, PhD (Somewhere) a.person@example.org' } as any;
    expect(component.byline).toBe('Run by A. Person, PhD (Somewhere)');
    expect(component.contact).toBe('a.person@example.org');
  });
});
