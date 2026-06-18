import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoginStateService } from './login-state.service';

export interface CompoundList {
  id: number;
  name: string;
  created_on: string;
  item_count: number;
}

export type CompoundListSummary = CompoundList;

export interface CompoundListItem {
  compound_id: string;
  label: string | null;
  added_on: string;
}

@Injectable({ providedIn: 'root' })
export class CompoundListsService {
  private listsSubject = new BehaviorSubject<CompoundList[]>([]);
  lists$ = this.listsSubject.asObservable();

  constructor(private http: HttpClient, private loginState: LoginStateService) {
    this.loginState.isUserLoggedIn.subscribe(state => {
      if (state.loggedIn) {
        this.loadLists();
      } else {
        this.listsSubject.next([]);
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders().set('Authorization', token);
  }

  loadLists(): void {
    this.http.get<{ status: string; data: CompoundList[] }>(
      '/api/compound_lists',
      { headers: this.getHeaders() }
    ).subscribe(res => this.listsSubject.next(res.data));
  }

  createList(name: string): Observable<any> {
    return this.http.post(
      '/api/compound_lists',
      { name },
      { headers: this.getHeaders() }
    ).pipe(tap(() => this.loadLists()));
  }

  deleteList(listId: number): void {
    this.http.delete(
      `/api/compound_lists/${listId}`,
      { headers: this.getHeaders() }
    ).subscribe(() => {
      this.listsSubject.next(this.listsSubject.value.filter(l => l.id !== listId));
    });
  }

  getListItems(listId: number): Observable<{ status: string; data: CompoundListItem[] }> {
    return this.http.get<{ status: string; data: CompoundListItem[] }>(
      `/api/compound_lists/${listId}/items`,
      { headers: this.getHeaders() }
    );
  }

  getItems(listId: number): Observable<CompoundListItem[]> {
    return this.getListItems(listId).pipe(map(res => res.data));
  }

  addToList(listId: number, compoundId: string, label?: string): Observable<any> {
    return this.http.post(
      `/api/compound_lists/${listId}/items`,
      { compound_id: compoundId, label: label || null },
      { headers: this.getHeaders() }
    );
  }

  removeFromList(listId: number, compoundId: string): void {
    const req = new HttpRequest(
      'DELETE',
      `/api/compound_lists/${listId}/items`,
      { compound_id: compoundId },
      { headers: this.getHeaders() }
    );
    this.http.request(req).subscribe();
  }
}
