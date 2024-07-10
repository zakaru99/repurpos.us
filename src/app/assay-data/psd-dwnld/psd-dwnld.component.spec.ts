import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsdDwnldComponent } from './psd-dwnld.component';

describe('PsdDwnldComponent', () => {
  let component: PsdDwnldComponent;
  let fixture: ComponentFixture<PsdDwnldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsdDwnldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsdDwnldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
