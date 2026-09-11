import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AssaysComponent } from './assays.component';
import { ColorPaletteService } from '../_services/index';
import { StandardizeAssayTypePipe } from '../_pipes/standardize-assay-type.pipe';
import { SciItalicizePipe } from '../_pipes/sci-italicize.pipe';

@Component({ selector: 'app-dropdown', template: '' })
class DropdownStubComponent {
  @Input() types: string[];
  @Output() typeSelected = new EventEmitter<string>();
}

describe('AssaysComponent', () => {
  let component: AssaysComponent;
  let fixture: ComponentFixture<AssaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        MatChipsModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      declarations: [
        AssaysComponent,
        DropdownStubComponent,
        StandardizeAssayTypePipe,
        SciItalicizePipe
      ],
      providers: [
        ColorPaletteService,
        Title,
        Meta,
        StandardizeAssayTypePipe,
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
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
});
