import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';

// Landing page for the link in the registration email. Confirms the token on
// load (POST /api/auth/confirm): 200 confirmed, 501 already confirmed, other
// errors invalid or expired, in which case a new link can be requested
// (POST /api/auth/confirm/link).
@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {
  cid: string;
  state: 'checking' | 'confirmed' | 'already' | 'failed' | 'resent' = 'checking';
  confirmForm: FormGroup;

  submitted = false;
  sending = false;
  resendError = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, @Inject(FormBuilder) fb: FormBuilder) {
    route.params.subscribe(params => this.cid = params['cid']);
    this.confirmForm = fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  ngOnInit() {
    this.http.post<any>('/api/auth/confirm', { token: this.cid }).subscribe(
      res => this.state = res && res.status === 'success' ? 'confirmed' : 'failed',
      (err: HttpErrorResponse) => this.state = err.status === 501 ? 'already' : 'failed'
    );
  }

  showErr(): boolean {
    const c = this.confirmForm.controls['email'];
    return c.invalid && (c.touched || this.submitted);
  }

  resend() {
    this.submitted = true;
    this.resendError = '';
    if (this.confirmForm.invalid) { return; }
    this.sending = true;
    this.http.post<any>('/api/auth/confirm/link', { email: this.confirmForm.controls.email.value }).subscribe(
      res => {
        this.sending = false;
        if (res && res.status === 'success') {
          this.state = 'resent';
          this.submitted = false;
        } else {
          this.resendError = (res && res.message) || 'The link could not be sent. Please try again.';
        }
      },
      (err: HttpErrorResponse) => {
        this.sending = false;
        this.resendError = (err.error && err.error.message) || 'The link could not be sent. Please try again.';
      }
    );
  }

  signIn() {
    window.dispatchEvent(new CustomEvent('reframe-sign-in'));
  }
}
