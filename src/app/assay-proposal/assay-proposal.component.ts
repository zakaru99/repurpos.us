import { Component, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm, NgModel } from '@angular/forms';
import { LoginStateService } from '../_services';
import { LoginState } from '../_models/index';

// One or more email addresses, separated by commas
const EMAIL_LIST = '^\s*[^@\s,]+@[^@\s,]+\.[^@\s,]+(\s*,\s*[^@\s,]+@[^@\s,]+\.[^@\s,]+)*\s*$';

// Assay proposal: one compact form.
// Signed-in only; after a
// successful submit the form gives way to a confirmation that points to
// My assays.
@Component({
  selector: 'app-assay-proposal',
  templateUrl: './assay-proposal.component.html',
  styleUrls: ['./assay-proposal.component.scss']
})
export class AssayProposalComponent {
  readonly emailPattern = EMAIL_LIST;

  formData = this.emptyForm();

  isSubmitting = false;
  submitError = '';
  // Indication of the proposal just submitted (shows the confirmation)
  submitted = '';
  loggedIn = false;
  private accountEmail = '';

  constructor(private http: HttpClient, private loginStateService: LoginStateService, private el: ElementRef) {
    loginStateService.isUserLoggedIn.subscribe((logState: LoginState) => {
      this.loggedIn = logState.loggedIn;
      this.accountEmail = logState.email || '';
      // Start from the account's address; it can be changed or extended
      if (this.accountEmail && !this.formData.contactEmail) { this.formData.contactEmail = this.accountEmail; }
    });
  }

  // Show a field's error once it's been left, or after a submit attempt
  show(ctrl: NgModel, form: NgForm): boolean {
    return !!ctrl && ctrl.invalid && (ctrl.touched || form.submitted);
  }

  onSubmit(form: NgForm): void {
    this.submitError = '';
    if (form.invalid) {
      // Take the user to the first field that needs attention
      setTimeout(() => {
        const first = this.el.nativeElement.querySelector('.field.invalid input, .field.invalid textarea');
        if (first) { first.focus(); }
      });
      return;
    }

    this.isSubmitting = true;
    const headers = new HttpHeaders().set('Authorization', localStorage.getItem('auth_token') || '');
    this.http.post('/api/assay_proposal', this.formData, { headers }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitted = this.formData.indication;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = (err && err.error && err.error.error) || 'Your proposal couldn\'t be submitted. Please try again.';
      }
    });
  }

  startAnother() {
    this.formData = this.emptyForm();
    this.submitted = '';
  }

  signInPrompt() {
    window.dispatchEvent(new CustomEvent('reframe-sign-in'));
  }

  private emptyForm() {
    return {
      contactName: '',
      contactEmail: this.accountEmail || '',
      institution: '',
      indication: '',
      volume: null as number | null,
      concentration: null as number | null,
      description: '',
      notes: ''
    };
  }
}
