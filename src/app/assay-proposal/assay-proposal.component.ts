import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { LoginStateService } from '../_services';
import { LoginState } from '../_models/index';


@Component({
  selector: 'app-assay-proposal',
  templateUrl: './assay-proposal.component.html',
  styleUrls: ['./assay-proposal.component.scss']
})
export class AssayProposalComponent {

  formData = {
    contactName: '',
    contactEmail: '',
    institution: '',
    indication: '',
    volume: null as number | null,
    concentration: null as number | null,
    description: '',
    notes: ''
  };

  isSubmitting = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  loggedIn: boolean = false;

  constructor(private http: HttpClient, private loginStateService: LoginStateService) {
    loginStateService.isUserLoggedIn.subscribe((logState: LoginState) => {
      this.loggedIn = logState.loggedIn
    })
  }

  onSubmit(proposalForm: NgForm): void {
    this.isSubmitting = true;
    this.toastMessage = '';

    this.http.post('/api/assay_proposal', this.formData)
      .subscribe({
        next: (response: any) => {
        this.isSubmitting = false;
        this.toastType = 'success';
        this.toastMessage = 'Proposal submitted successfully!';
          this.formData = {
            contactName: '',
            contactEmail: '',
            institution: '',
            indication: '',
            volume: null,
            concentration: null,
            description: '',
            notes: ''
          };
          proposalForm.resetForm();
          setTimeout(() => this.toastMessage = '', 3000);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastType = 'error';
          this.toastMessage = 'Submission failed. Please try again.';
          setTimeout(() => this.toastMessage = '', 3000);
        }
      });
  }
}