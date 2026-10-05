import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material';

import { UserRegistrationComponent } from './user-registration.component';

@Component({ selector: 'mat-form-field', template: '<ng-content></ng-content>' })
class MatFormFieldStubComponent {}

@Component({ selector: 'mat-error', template: '<ng-content></ng-content>' })
class MatErrorStubComponent {}

@Component({ selector: 're-captcha', template: '' })
class ReCaptchaStubComponent {
  @Input() siteKey: string;
  @Output() resolved = new EventEmitter<string>();
}

describe('UserRegistrationComponent', () => {
  let component: UserRegistrationComponent;
  let fixture: ComponentFixture<UserRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, HttpClientTestingModule ],
      declarations: [
        UserRegistrationComponent,
        MatFormFieldStubComponent,
        MatErrorStubComponent,
        ReCaptchaStubComponent
      ],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
