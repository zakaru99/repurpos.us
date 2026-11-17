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

  getUserEmail(): string | null {
    const state = this.isUserLoggedIn.value;
    return state.loggedIn ? state.email || null : null;
  }
}
