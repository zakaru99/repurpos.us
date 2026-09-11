import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOverviewExampleDialog } from './dialog-overview-example-dialog.component';

describe('DialogOverviewExampleDialog', () => {
  let component: DialogOverviewExampleDialog;
  let fixture: ComponentFixture<DialogOverviewExampleDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogOverviewExampleDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogOverviewExampleDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
