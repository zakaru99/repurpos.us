import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';

import { PasswordValidation } from '../_models/password-validation';
import { LoginStateService } from '../_services/index';

// Landing page for the link in the reset-password email. Checks the token on
// load (POST /api/auth/reset_pass/check), then saves the new password
// (POST /api/auth/reset_pass). An expired link sends the user to the sign-in
// box's reset view for a new one.
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  rid: string;
  state: 'checking' | 'ready' | 'done' | 'invalid' = 'checking';
  saveError = '';
  submitted = false;
  sending = false;
  resetPasswordForm: FormGroup;

  constructor(private route: ActivatedRoute, private http: HttpClient, @Inject(FormBuilder) fb: FormBuilder,
              private router: Router, private loginState: LoginStateService) {
    route.params.subscribe(params => this.rid = params['rid']);
    this.resetPasswordForm = fb.group({
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validator: PasswordValidation.MatchPassword });
  }

  ngOnInit() {
    this.http.post<any>('/api/auth/reset_pass/check', { token: this.rid }).subscribe(
      res => this.state = res && res.status === 'success' ? 'ready' : 'invalid',
      () => this.state = 'invalid'
    );
  }

  showErr(name: string): boolean {
    const c = this.resetPasswordForm.controls[name];
    return c.invalid && (c.touched || this.submitted);
  }

  onSubmit() {
    this.submitted = true;
    this.saveError = '';
    if (this.resetPasswordForm.invalid) { return; }
    this.sending = true;
    this.http.post<any>('/api/auth/reset_pass', {
      token: this.rid,
      password: this.resetPasswordForm.controls.password.value
    }).subscribe(
      res => {
        this.sending = false;
        if (res && res.status === 'success') {
          this.state = 'done';
          // A session from before the change would leave the header signed in,
          // and the Sign in button below would do nothing: end it, so the user
          // signs in with the new password
          window.dispatchEvent(new CustomEvent('reframe-sign-out'));
        } else {
          this.saveError = (res && res.message) || 'Your password could not be changed. Please try again.';
        }
      },
      (err: HttpErrorResponse) => {
        this.sending = false;
        this.saveError = (err.error && err.error.message) || 'Your password could not be changed. Please try again.';
      }
    );
  }

  signIn() {
    window.dispatchEvent(new CustomEvent('reframe-sign-in'));
  }

  // Opens the sign-in box on its "Reset your password" view. Signed in, that
  // box can't open: the account page sends a new link instead.
  requestNewLink() {
    if (this.loginState.hasSession()) {
      this.router.navigate(['/user_portal/my_account']);
      return;
    }
    window.dispatchEvent(new CustomEvent('reframe-sign-in', { detail: { mode: 'forgot' } }));
  }
}
