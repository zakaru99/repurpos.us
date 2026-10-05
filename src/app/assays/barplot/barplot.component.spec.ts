import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BarplotComponent } from './barplot.component';
import { ColorPaletteService } from '../../_services/color-palette.service';

describe('BarplotComponent', () => {
  let component: BarplotComponent;
  let fixture: ComponentFixture<BarplotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ BarplotComponent ],
      providers: [ColorPaletteService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarplotComponent);
    component = fixture.componentInstance;
    component.data = [];
    component.yDomain = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
