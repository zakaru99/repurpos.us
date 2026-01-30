import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  registered_on?: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  searchQuery: string = '';
  searchResults: User[] = [];
  admins: User[] = [];
  errorMsg: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    const params = new HttpParams().set('admins', 'true');
    this.http.get<{ success: boolean; data: User[] }>('/api/users', { params })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.admins = res.data;
          } else {
            console.error('Failed to load admins:', res);
            this.errorMsg = 'Failed to load admins';
          }
        },
        error: (err) => {
          console.error('Error loading admins:', err);
          this.errorMsg = 'Error loading admins';
        }
      });
  }

  searchUser(): void {
    const term = this.searchQuery.trim();
    if (!term) {
      this.searchResults = [];
      return;
    }

    const params = new HttpParams().set('search', term);
    this.http.get<{ success: boolean; data: User[] }>('/api/users', { params })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.searchResults = res.data;
          } else {
            console.error('Search failed:', res);
            this.errorMsg = 'Search failed';
          }
        },
        error: (err) => {
          console.error('Error during search:', err);
          this.errorMsg = 'Error during search';
        }
      });
  }

  makeAdmin(user: User): void {
    this.http.post<{ success: boolean; message: string }>('/api/users', {
      user_id: user.id,
      make_admin: true
    }).subscribe({
      next: (res) => {
        if (res.success) {
          user.isAdmin = true;
          this.loadAdmins(); // refresh admin table
          this.searchResults = []; // clear search results
          this.searchQuery = '';   // optional: clear search input
        } else {
          console.error('Failed to make admin:', res);
          this.errorMsg = 'Failed to make admin';
        }
      },
      error: (err) => {
        console.error('Error making admin:', err);
        this.errorMsg = 'Error making admin';
      }
    });
  }


  revokeAdmin(user: User): void {
    this.http.post<{ success: boolean; message: string }>('/api/users', {
      user_id: user.id,
      make_admin: false  // <-- revoke
    }).subscribe({
      next: (res) => {
        if (res.success) {
          // Remove from admin list
          this.admins = this.admins.filter(u => u.id !== user.id);

          // Update searchResults if needed
          const found = this.searchResults.find(u => u.id === user.id);
          if (found) found.isAdmin = false;
        } else {
          console.error('Failed to revoke admin:', res);
          this.errorMsg = 'Failed to revoke admin';
        }
      },
      error: (err) => {
        console.error('Error revoking admin:', err);
        this.errorMsg = 'Error revoking admin';
      }
    });
  }

}
