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

  onSubmit(form: any) {
    if (!form.valid || !this.recaptchaToken) return;

    this.isSubmitting = true;

    this.http.post('/api/contact', { ...this.formData, recaptcha_token: this.recaptchaToken }).subscribe({
      next: () => {
        this.toastMessage = "Message sent successfully!";
        this.toastType = "success";
        form.resetForm();
      },
      error: () => {
        this.toastMessage = "Failed to send message.";
        this.toastType = "error";
      },
      complete: () => {
        this.isSubmitting = false;
        this.recaptchaToken = null;
        grecaptcha.reset();
        setTimeout(() => (this.toastMessage = ''), 3000);
      }
    });
  }
}
