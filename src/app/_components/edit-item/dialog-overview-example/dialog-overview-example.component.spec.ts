import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOverviewExample } from './dialog-overview-example.component';

describe('DialogOverviewExample', () => {
  let component: DialogOverviewExample;
  let fixture: ComponentFixture<DialogOverviewExample>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogOverviewExample ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogOverviewExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
