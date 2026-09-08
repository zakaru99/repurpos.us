import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog, ErrorStateMatcher } from '@angular/material';
import { LoginFailComponent } from '../../_dialogs/index';
import { LoginStateService } from '../../_services/index';

interface UserStatus {
  user_id: number;
  email: string;
  admin: boolean;
  registered_on: string;
}

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {

  loggedIn = false;
  isAdmin = false;

  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);

  // Errors only surface after a failed submit attempt, not as soon as a
  // field is blurred - Material's default (touched-based) error matcher
  // was flagging fields the instant a user tabbed through the form.
  submitted = false;
  errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null): boolean =>
      !!(control && control.invalid && this.submitted)
  };

  constructor(private http: HttpClient, private loginStateService: LoginStateService, public dialog: MatDialog) { }

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
      console.log(userInfo);
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
  if (this.email.invalid || this.password.invalid) {
    return;
  }
  const payload = { email: this.email.value, password: this.password.value };

  this.http.post<{ status: string; auth_token: string }>('/api/auth/login', payload)
    .subscribe({
      next: (res) => {
        localStorage.setItem('auth_token', res.auth_token);
        this.checkUserStatus(res.auth_token);
      },
      error: (err: HttpErrorResponse) => {
        this.dialog.open(LoginFailComponent, { data: { error: err.error.message } });
        this.logoutCleanup();
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
