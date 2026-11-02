import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AdminGuard, PortalGuard } from './admin.guard';
import { LoginStateService } from '../_services/index';

describe('Portal and admin guards', () => {
  let http: HttpTestingController;
  let router: Router;
  let loginState: LoginStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AdminGuard, PortalGuard, LoginStateService]
    });
    http = TestBed.get(HttpTestingController);
    router = TestBed.get(Router);
    loginState = TestBed.get(LoginStateService);
    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');
    localStorage.setItem('auth_token', 'token');
  });

  afterEach(() => {
    localStorage.removeItem('auth_token');
    http.verify();
  });

  // Runs a guard against a /auth/status reply and returns what it decided
  function run(guard: AdminGuard | PortalGuard, data: any): boolean {
    let result: boolean;
    guard.canActivate().subscribe(r => result = r);
    http.expectOne('/api/auth/status').flush({ status: 'success', data });
    return result;
  }

  const reviewer = { user_id: 2, email: 'rev@scripps.edu', admin: false, role: 'reviewer' };
  const admin = { user_id: 1, email: 'admin@scripps.edu', admin: true, role: 'admin' };
  const user = { user_id: 3, email: 'someone@example.org', admin: false, role: 'user' };

  it('lets reviewers and admins into the portal', () => {
    expect(run(TestBed.get(PortalGuard), reviewer)).toBe(true);
    expect(loginState.isUserLoggedIn.value.role).toBe('reviewer');
    expect(run(TestBed.get(PortalGuard), admin)).toBe(true);
  });

  it('keeps other users out of the portal', () => {
    expect(run(TestBed.get(PortalGuard), user)).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('sends reviewers from admin-only pages to the proposals', () => {
    expect(run(TestBed.get(AdminGuard), reviewer)).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/internal/proposals');
  });

  it('lets admins onto admin-only pages', () => {
    expect(run(TestBed.get(AdminGuard), admin)).toBe(true);
  });

  it('treats an admin from a backend without roles as an admin', () => {
    expect(run(TestBed.get(AdminGuard), { user_id: 1, email: 'a@x.org', admin: true })).toBe(true);
  });
});
