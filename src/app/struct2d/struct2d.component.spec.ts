import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { Struct2dComponent } from './struct2d.component';
import { StructureSvgService } from '../_services/structure-svg.service';

const SVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><circle cx='5' cy='5' r='4'/></svg>";

describe('Struct2dComponent', () => {
  let component: Struct2dComponent;
  let fixture: ComponentFixture<Struct2dComponent>;
  let svgSvc: StructureSvgService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ Struct2dComponent ],
      providers: [ StructureSvgService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Struct2dComponent);
    component = fixture.componentInstance;
    svgSvc = TestBed.get(StructureSvgService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows SVG markup it is given as is, inline', () => {
    component.structure = SVG;
    component.struct_type = 'svg';
    component.ngOnChanges();
    component.showMyElement = true;
    fixture.detectChanges();
    expect(component.raw).toBe(SVG);
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.svg-wrapper');
    expect(wrapper.querySelector('svg')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('asks the API to draw other structure types', () => {
    spyOn(svgSvc, 'getSVG').and.returnValue(of(SVG));
    component.structure = 'CCO';
    component.struct_type = 'smiles';
    component.ngOnChanges();
    expect(svgSvc.getSVG).toHaveBeenCalledWith('CCO', 'smiles');
    expect(component.raw).toBe(SVG);
  });

  it('clears the drawing when there is no structure', () => {
    component.structure = SVG;
    component.struct_type = 'svg';
    component.ngOnChanges();
    component.structure = null;
    component.ngOnChanges();
    expect(component.raw).toBeNull();
    expect(component.svg).toBeNull();
  });

  it('offers a download only when asked to and drawn', () => {
    component.launch_search = false;
    component.downloadable = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.struct-download')).toBeNull();
    component.structure = SVG;
    component.struct_type = 'svg';
    component.ngOnChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.struct-download')).toBeTruthy();
  });

  it('names the download after the compound', () => {
    component.name = 'CA-07-115 / test';
    expect(component.fileName).toBe('CA-07-115_test.svg');
  });
});
