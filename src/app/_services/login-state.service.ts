import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { LoginState } from '../_models/index';

@Injectable()
export class LoginStateService {

  private loginSubject = new Subject<LoginState>();
  loginState = this.loginSubject.asObservable();

  public isUserLoggedIn: BehaviorSubject<LoginState> = new BehaviorSubject<LoginState>({
    loggedIn: false,
    isAdmin: false,
    email: null
  });

  constructor() {}

  setLoginState(loggedIn: boolean, isAdmin: boolean, email: string | null = null) {
    const state: LoginState = { loggedIn, isAdmin, email };
    this.loginSubject.next(state);
    this.isUserLoggedIn.next(state);
  }

  loggedIn(isAdmin: boolean, email: string) {
    this.setLoginState(true, isAdmin, email);
  }

  loggedOut() {
    this.setLoginState(false, false, null);
  }

  getUserEmail(): string | null {
    const state = this.isUserLoggedIn.value;
    return state.loggedIn ? state.email || null : null;
  }
}
