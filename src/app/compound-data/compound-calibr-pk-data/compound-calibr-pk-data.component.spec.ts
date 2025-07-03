import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoundCalibrPkDataComponent } from './compound-calibr-pk-data.component';

describe('CompoundCalibrPkDataComponent', () => {
  let component: CompoundCalibrPkDataComponent;
  let fixture: ComponentFixture<CompoundCalibrPkDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompoundCalibrPkDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundCalibrPkDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
