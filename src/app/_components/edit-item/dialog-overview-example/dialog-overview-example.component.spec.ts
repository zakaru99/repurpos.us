import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material';

import { DialogOverviewExample } from './dialog-overview-example.component';

@Component({ selector: 'mat-form-field', template: '<ng-content></ng-content>' })
class MatFormFieldStubComponent {}

describe('DialogOverviewExample', () => {
  let component: DialogOverviewExample;
  let fixture: ComponentFixture<DialogOverviewExample>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule ],
      declarations: [ DialogOverviewExample, MatFormFieldStubComponent ],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
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
