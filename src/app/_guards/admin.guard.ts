import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginStateService } from '../_services';
import { Role, hasPortal, roleOf } from '../_models/index';

interface UserStatus {
  user_id: number;
  email: string;
  admin: boolean;
  role?: string;
  registered_on: string;
}

// Asks the backend for the signed-in user's role, then lets the route open if
// `allowed` says so. The backend checks every call too; this only keeps
// people off pages they can't use.
abstract class RoleGuard implements CanActivate {

  constructor(
    protected loginStateService: LoginStateService,
    protected router: Router,
    private http: HttpClient
  ) {}

  protected abstract allowed(role: Role): boolean;

  // Where someone signed in without the role is sent
  protected abstract fallback(role: Role): string;

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      this.router.navigate(['/']);
      return of(false);
    }

    return this.http.get<{ status: string; data: UserStatus }>('/api/auth/status', {
      headers: new HttpHeaders().set('Authorization', token)
    }).pipe(
      map(res => {
        const userInfo = res.data;
        const role = roleOf(userInfo);

        this.loginStateService.loggedIn(role, userInfo.email);

        if (!this.allowed(role)) {
          this.router.navigateByUrl(this.fallback(role));
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.loginStateService.loggedOut();
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}

// The admin portal as a whole: admins, reviewers and read-only staff
@Injectable({
  providedIn: 'root'
})
export class PortalGuard extends RoleGuard {
  constructor(loginStateService: LoginStateService, router: Router, http: HttpClient) {
    super(loginStateService, router, http);
  }

  protected allowed(role: Role) { return hasPortal(role); }

  protected fallback() { return '/'; }
}

// Admin-only pages inside the portal (access and maintenance). Other staff
// who land on one are sent to the proposals instead.
@Injectable({
  providedIn: 'root'
})
export class AdminGuard extends RoleGuard {
  constructor(loginStateService: LoginStateService, router: Router, http: HttpClient) {
    super(loginStateService, router, http);
  }

  protected allowed(role: Role) { return role === 'admin'; }

  protected fallback(role: Role) {
    return hasPortal(role) ? '/internal/proposals' : '/';
  }
}
