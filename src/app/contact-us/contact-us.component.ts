import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {

  isSubmitting = false;
  toastMessage = "";
  toastType = "";

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(private http: HttpClient) {}

  onSubmit(form: any) {
    if (!form.valid) return;

    this.isSubmitting = true;

    this.http.post('/api/contact', this.formData).subscribe({
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
        setTimeout(() => (this.toastMessage = ''), 3000);
      }
    });
  }
}
