import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroTextModernComponent } from './intro-text-modern.component';

describe('IntroTextModernComponent', () => {
  let component: IntroTextModernComponent;
  let fixture: ComponentFixture<IntroTextModernComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntroTextModernComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroTextModernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
