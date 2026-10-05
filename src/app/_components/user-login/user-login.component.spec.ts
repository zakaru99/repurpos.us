import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Directive, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material';

import { UserLoginComponent } from './user-login.component';
import { LoginStateService } from '../../_services/index';

@Component({ selector: 'mat-form-field', template: '<ng-content></ng-content>' })
class MatFormFieldStubComponent {}

// Stands in for MatInput so the template's [errorStateMatcher] binding on
// <input matInput> is a known property (it's a MatInput input, not mat-form-field's).
@Directive({ selector: 'input[matInput]' })
class MatInputStubDirective {
  @Input() errorStateMatcher: any;
}

@Component({ selector: 'mat-error', template: '<ng-content></ng-content>' })
class MatErrorStubComponent {}

@Component({ selector: 'app-forgot-pass-button', template: '' })
class ForgotPassButtonStubComponent {}

@Component({ selector: 'app-reg-user-dialog', template: '' })
class RegUserDialogStubComponent {}

describe('UserLoginComponent', () => {
  let component: UserLoginComponent;
  let fixture: ComponentFixture<UserLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, HttpClientTestingModule ],
      declarations: [
        UserLoginComponent,
        MatFormFieldStubComponent,
        MatInputStubDirective,
        MatErrorStubComponent,
        ForgotPassButtonStubComponent,
        RegUserDialogStubComponent
      ],
      providers: [
        LoginStateService,
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
