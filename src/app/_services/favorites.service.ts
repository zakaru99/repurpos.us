import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginStateService } from './login-state.service';

export interface FavoriteItem {
  compound_id: string;
  label: string | null;
  saved_on: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favoriteIds = new Set<string>();
  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient, private loginState: LoginStateService) {
    this.loginState.isUserLoggedIn.subscribe(state => {
      if (state.loggedIn) {
        this.load();
      } else {
        this.favoriteIds.clear();
        this.favoritesSubject.next([]);
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders().set('Authorization', token);
  }

  load(): void {
    this.http.get<{ status: string; data: FavoriteItem[] }>(
      `/api/favorites`,
      { headers: this.getHeaders() }
    ).subscribe(res => {
      this.favoriteIds = new Set(res.data.map(f => f.compound_id));
      this.favoritesSubject.next(res.data);
    });
  }

  isFavorite(compoundId: string): boolean {
    return this.favoriteIds.has(compoundId);
  }

  add(compoundId: string, label?: string): void {
    this.http.post(
      `/api/favorites`,
      { compound_id: compoundId, label: label || null },
      { headers: this.getHeaders() }
    ).subscribe(() => {
      this.favoriteIds.add(compoundId);
      const current = this.favoritesSubject.value;
      this.favoritesSubject.next([
        ...current,
        { compound_id: compoundId, label: label || null, saved_on: new Date().toISOString() }
      ]);
    });
  }

  remove(compoundId: string): void {
    this.http.delete(
      `/api/favorites/${compoundId}`,
      { headers: this.getHeaders() }
    ).subscribe(() => {
      this.favoriteIds.delete(compoundId);
      this.favoritesSubject.next(this.favoritesSubject.value.filter(f => f.compound_id !== compoundId));
    });
  }

  toggle(compoundId: string, label?: string): void {
    this.isFavorite(compoundId) ? this.remove(compoundId) : this.add(compoundId, label);
  }
}
