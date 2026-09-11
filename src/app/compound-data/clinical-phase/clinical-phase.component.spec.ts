import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';

import { ClinicalPhaseComponent } from './clinical-phase.component';
import { TitleCasePipe } from '../../_pipes';

describe('ClinicalPhaseComponent', () => {
  let component: ClinicalPhaseComponent;
  let fixture: ComponentFixture<ClinicalPhaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTooltipModule],
      declarations: [ ClinicalPhaseComponent, TitleCasePipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicalPhaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
