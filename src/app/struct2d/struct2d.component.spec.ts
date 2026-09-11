import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Struct2dComponent } from './struct2d.component';
import { StructureSvgService } from '../_services/structure-svg.service';

describe('Struct2dComponent', () => {
  let component: Struct2dComponent;
  let fixture: ComponentFixture<Struct2dComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
