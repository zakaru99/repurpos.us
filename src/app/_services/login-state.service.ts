import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { LoginState, Role } from '../_models/index';

@Injectable()
export class LoginStateService {

  private loginSubject = new Subject<LoginState>();
  loginState = this.loginSubject.asObservable();

  public isUserLoggedIn: BehaviorSubject<LoginState> = new BehaviorSubject<LoginState>({
    loggedIn: false,
    isAdmin: false,
    role: 'user',
    email: null
  });

  constructor() {}

  setLoginState(loggedIn: boolean, role: Role, email: string | null = null) {
    const state: LoginState = { loggedIn, isAdmin: role === 'admin', role, email };
    this.loginSubject.next(state);
    this.isUserLoggedIn.next(state);
  }

  loggedIn(role: Role, email: string) {
    this.setLoginState(true, role, email);
  }

  loggedOut() {
    this.setLoginState(false, 'user', null);
  }

  // Signed in, or holding a token the header hasn't verified yet (the state
  // starts signed out until it does). For showing or hiding sign-in prompts
  // without a flash; the backend still checks the token.
  hasSession(): boolean {
    return this.isUserLoggedIn.value.loggedIn || !!localStorage.getItem('auth_token');
  }

  getUserEmail(): string | null {
    const state = this.isUserLoggedIn.value;
    return state.loggedIn ? state.email || null : null;
  }
}
