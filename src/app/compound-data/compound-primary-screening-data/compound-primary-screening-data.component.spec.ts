import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CompoundPrimaryScreeningDataComponent } from './compound-primary-screening-data.component';
import { CompoundService, ColorPaletteService } from '../../_services';
import { SciItalicizePipe } from '../../_pipes/sci-italicize.pipe';

class CompoundServiceStub {
  primaryDataState = of([]);
}

describe('PrimaryScreeningDataComponent', () => {
  let component: CompoundPrimaryScreeningDataComponent;
  let fixture: ComponentFixture<CompoundPrimaryScreeningDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ CompoundPrimaryScreeningDataComponent, SciItalicizePipe ],
      providers: [
        { provide: CompoundService, useValue: new CompoundServiceStub() },
        ColorPaletteService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundPrimaryScreeningDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
