import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { LoginStateService } from '../_services/index';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule
      ],
      declarations: [ ResetPasswordComponent ],
      providers: [
        LoginStateService,
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // A browser still signed in would ignore the Sign in button afterwards
  it('signs this browser out once the new password is saved', () => {
    const http = TestBed.get(HttpTestingController);
    const events: string[] = [];
    const listener = (e: Event) => events.push(e.type);
    window.addEventListener('reframe-sign-out', listener);

    component.resetPasswordForm.setValue({ password: 'newpassword1', confirmPassword: 'newpassword1' });
    component.onSubmit();
    http.expectOne('/api/auth/reset_pass').flush({ status: 'success' });

    window.removeEventListener('reframe-sign-out', listener);
    expect(component.state).toBe('done');
    expect(events).toEqual(['reframe-sign-out']);
  });

  it('sends a signed-in user to the account page for a new reset link', () => {
    const router = TestBed.get(Router);
    spyOn(router, 'navigate');
    spyOn(TestBed.get(LoginStateService), 'hasSession').and.returnValue(true);

    component.requestNewLink();

    expect(router.navigate).toHaveBeenCalledWith(['/user_portal/my_account']);
  });
});
