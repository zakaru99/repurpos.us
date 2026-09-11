import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { of } from 'rxjs';

import { AssayDataComponent } from './assay-data.component';
import { SciItalicizePipe } from '../_pipes/sci-italicize.pipe';
import { EmbedDatasetMetadataDirective } from '../_services/embed-dataset-metadata.directive';

@Component({ selector: 'app-citation', template: '' })
class CitationStubComponent {
  @Input() citations: any;
}

@Component({ selector: 'app-psd-dwnld', template: '' })
class PsdDwnldStubComponent {}

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
      imports: [HttpClientTestingModule],
      declarations: [
        AssayDataComponent,
        SciItalicizePipe,
        EmbedDatasetMetadataDirective,
        CitationStubComponent,
        PsdDwnldStubComponent,
        AssayPlotsStubComponent
      ],
      providers: [
        Title,
        Meta,
        { provide: ActivatedRoute, useValue: { params: of({}) } }
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
  });
});
