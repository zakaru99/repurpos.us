import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';

import { DialogOverviewExampleDialog } from './dialog-overview-example-dialog.component';

@Component({ selector: 'mat-form-field', template: '<ng-content></ng-content>' })
class MatFormFieldStubComponent {}

describe('DialogOverviewExampleDialog', () => {
  let component: DialogOverviewExampleDialog;
  let fixture: ComponentFixture<DialogOverviewExampleDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MatDialogModule ],
      declarations: [ DialogOverviewExampleDialog, MatFormFieldStubComponent ],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Test', animal: '' } }
      ]
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
