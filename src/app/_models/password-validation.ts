import { AbstractControl } from '@angular/forms';

// Group validator: marks confirmPassword when it differs from password
export class PasswordValidation {
  static MatchPassword(AC: AbstractControl) {
    const password = AC.get('password').value;
    const confirmPassword = AC.get('confirmPassword').value;
    if (password !== confirmPassword) {
      AC.get('confirmPassword').setErrors({ MatchPassword: true });
    } else {
      AC.get('confirmPassword').setErrors(null);
      return null;
    }
  }
}
