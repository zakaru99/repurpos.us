import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var grecaptcha: any;

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {

  isSubmitting = false;
  toastMessage = "";
  toastType = "";
  recaptchaToken: string;

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(private http: HttpClient) {}

  onCaptchaResolved(token: string) {
    this.recaptchaToken = token;
  }

  private done() {
    this.isSubmitting = false;
    this.recaptchaToken = null;
    try { grecaptcha.reset(); } catch (e) { /* captcha not loaded */ }
  }

  onSubmit(form: any) {
    if (!form.valid || !this.recaptchaToken) return;

    this.isSubmitting = true;

    this.toastMessage = '';
    this.toastType = '';
    this.http.post('/api/contact', { ...this.formData, recaptcha_token: this.recaptchaToken }).subscribe({
      next: () => {
        // The confirmation stays on the page until the person sends another
        this.toastMessage = 'Message sent.';
        this.toastType = 'success';
        form.resetForm();
        this.done();
      },
      // `complete` doesn't run after an error, so tidy up here too
      error: () => {
        this.toastMessage = 'Failed to send message.';
        this.toastType = 'error';
        this.done();
      }
    });
  }
}
