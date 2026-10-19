import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TermsComponent } from '../../_dialogs/index';
import { PasswordValidation } from '../../_models/password-validation';
import { LoginStateService } from '../../_services/index';

declare var grecaptcha: any;

const LOGIN_FAILED = 'Sign-in failed. Check your email and password.';
const REG_FAILED = 'Your account could not be created. Please try again.';
const RESET_FAILED = 'The link could not be sent. Please try again.';

interface UserStatus {
  user_id: number;
  email: string;
  admin: boolean;
  registered_on: string;
}

// The header's account box: sign in, create an account or reset the password,
// all in the same card (no pop-ups). Sign-in errors show inline.
@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit, OnChanges {
  // Whether the header's box is open; closing it returns to the sign-in view
  @Input() open = false;

  loggedIn = false;
  isAdmin = false;
  mode: 'signin' | 'register' | 'forgot' = 'signin';
  sending = false;

  // Sign in. Errors only surface after a submit attempt, not on blur.
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  submitted = false;
  loginError = '';

  // Create an account (POST /api/auth/register: email, password, recaptcha_token)
  regForm: FormGroup;
  regSubmitted = false;
  regDone = false;
  regMessage = '';
  recaptchaToken: string = null;

  // Reset password (POST /api/auth/reset_pass/link)
  resetEmail = new FormControl('', [Validators.required, Validators.email]);
  resetSubmitted = false;
  resetDone = false;
  resetMessage = '';

  constructor(private http: HttpClient, private loginStateService: LoginStateService, public dialog: MatDialog,
              fb: FormBuilder) {
    this.regForm = fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: fb.group({
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl('', [Validators.required])
      }, { validator: PasswordValidation.MatchPassword })
    });
  }

  ngOnChanges() {
    if (!this.open) { this.show('signin'); }
  }

  // Switch views, carrying a typed email across and clearing old messages
  show(mode: 'signin' | 'register' | 'forgot') {
    const typed = this.email.value || this.regForm.get('email').value || this.resetEmail.value || '';
    this.mode = mode;
    this.sending = false;
    this.loginError = '';
    this.regMessage = '';
    this.regSubmitted = false;
    this.regDone = false;
    this.recaptchaToken = null;
    this.resetMessage = '';
    this.resetSubmitted = false;
    this.resetDone = false;
    if (mode === 'register' && !this.regForm.get('email').value) { this.regForm.get('email').setValue(typed); }
    if (mode === 'forgot' && !this.resetEmail.value) { this.resetEmail.setValue(typed); }
  }

  regErr(path: string): boolean {
    const c = this.regForm.get(path);
    return !!c && c.invalid && (c.touched || this.regSubmitted);
  }

  register() {
    this.regSubmitted = true;
    this.regMessage = '';
    if (this.regForm.invalid || !this.recaptchaToken) { return; }
    this.sending = true;
    this.http.post<any>('/api/auth/register',
      { email: this.regForm.get('email').value, password: this.regForm.get('password').value, recaptcha_token: this.recaptchaToken }
    ).subscribe({
      next: (res) => {
        this.sending = false;
        if (res && res.status === 'success') {
          this.regDone = true;
          this.regMessage = res.message;
        } else {
          this.regMessage = (res && res.message) || REG_FAILED;
          this.resetCaptcha();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.sending = false;
        this.regMessage = (err.error && err.error.message) || REG_FAILED;
        this.resetCaptcha();
      }
    });
  }

  sendReset() {
    this.resetSubmitted = true;
    this.resetMessage = '';
    if (this.resetEmail.invalid) { return; }
    this.sending = true;
    this.http.post<any>('/api/auth/reset_pass/link', { email: this.resetEmail.value }).subscribe({
      next: (res) => {
        this.sending = false;
        this.resetDone = !!res && res.status === 'success';
        this.resetMessage = res && res.message;
      },
      error: (err: HttpErrorResponse) => {
        this.sending = false;
        this.resetMessage = (err.error && err.error.message) || RESET_FAILED;
      }
    });
  }

  openTerms() {
    this.dialog.open(TermsComponent, { width: '80vw', height: '80vh' });
  }

  private resetCaptcha() {
    this.recaptchaToken = null;
    if (typeof grecaptcha !== 'undefined') { grecaptcha.reset(); }
  }

  ngOnInit() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.checkUserStatus(token);
    } else {
      this.logoutCleanup();
    }
  }

private checkUserStatus(token: string) {
  this.http.get<{ status: string; data: UserStatus }>('/api/auth/status', {
    headers: new HttpHeaders().set('Authorization', token)
  }).subscribe({
    next: (res) => {
      const userInfo = res.data;
      this.loggedIn = true;
      this.isAdmin = userInfo.admin;

    this.loginStateService.loggedIn(this.isAdmin, userInfo.email);
    this.email.reset();
    this.password.reset();
    },
    error: () => this.logoutCleanup()
  });
}

  onSubmit() {
    this.submitted = true;
    this.loginError = '';
    if (this.email.invalid || this.password.invalid) {
      return;
    }
    const payload = { email: this.email.value, password: this.password.value };

    this.sending = true;
    this.http.post<{ status: string; auth_token: string }>('/api/auth/login', payload)
      .subscribe({
        next: (res) => {
          this.sending = false;
          localStorage.setItem('auth_token', res.auth_token);
          this.checkUserStatus(res.auth_token);
        },
        error: (err: HttpErrorResponse) => {
          this.sending = false;
          // Keep the email so it can be corrected; clear the password
          const typed = this.email.value;
          this.logoutCleanup();
          this.email.setValue(typed);
          this.loginError = (err.error && err.error.message) || LOGIN_FAILED;
        }
      });
  }

  logout() {
    const token = localStorage.getItem('auth_token');
    if (!token) return this.logoutCleanup();

    this.http.post('/api/auth/logout', {}, {
      headers: new HttpHeaders().set('Authorization', token)
    }).subscribe({
      next: () => this.logoutCleanup(),
      error: () => this.logoutCleanup()
    });
  }

  private logoutCleanup() {
    localStorage.removeItem('auth_token');
    this.loggedIn = false;
    this.isAdmin = false;
    this.loginStateService.loggedOut();
    this.email.reset();
    this.password.reset();
    this.submitted = false;
  }
}
