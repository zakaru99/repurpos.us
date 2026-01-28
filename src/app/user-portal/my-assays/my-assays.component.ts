import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoginStateService } from '../../_services';

interface Assay {
  id: number;
  name: string;
  indication: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedOn: string;
}

@Component({
  selector: 'app-my-assays',
  templateUrl: './my-assays.component.html',
  styleUrls: ['./my-assays.component.scss']
})
export class MyAssaysComponent implements OnInit {
  assays: Assay[] = [];
  selectedStatus: '' | 'Pending' | 'Approved' | 'Rejected' = '';

  constructor(private http: HttpClient, private loginState: LoginStateService) { }

  ngOnInit(): void {
    this.loginState.isUserLoggedIn.subscribe(state => {
      if (state.loggedIn && state.email) {
        console.log(state.email)
        this.loadAssays(state.email);
      } else {
        this.assays = [];
      }
    });
  }

  loadAssays(userEmail: string): void {
    let params = new HttpParams().set('email', userEmail);
    if(this.selectedStatus){
      params = params.set('status', this.selectedStatus);
    }

    this.http.get<{success: boolean; data: Assay[]}>('/api/assay_proposal', { params })
    .subscribe({
      next: (res) => {
        if (res.success) {
          this.assays = res.data;
        } else {
          this.assays = [];
        }
      },
      error: (err) => {
        console.error('Error fetching assays:', err);
        this.assays = [];
      }
    });
  }

  filterByStatus(status: '' | 'Pending' | 'Approved' | 'Rejected'): void {
    this.selectedStatus = status;

    const email = this.loginState.getUserEmail();
    if (!email) return;

    this.loadAssays(email);
  }

    viewAssay(assay: Assay): void {
    console.log('View assay', assay);
    // Navigate to a details page or open modal
  }

  editAssay(assay: Assay): void {
    if (assay.status !== 'Pending') return;
    console.log('Edit assay', assay);
    // Open edit modal or navigate to edit form
  }

}
