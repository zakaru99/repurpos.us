import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginStateService } from '../_services';

interface UserStatus {
  user_id: number;
  email: string;
  admin: boolean;
  registered_on: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private loginStateService: LoginStateService,
    private router: Router,
    private http: HttpClient
  ) {}

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
        const isAdmin = userInfo.admin;

        this.loginStateService.loggedIn(isAdmin, userInfo.email);

        if (!isAdmin) {
          this.router.navigate(['/']);
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

