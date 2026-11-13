import { Component } from '@angular/core';
import { Router } from '@angular/router';

// /terms: the terms of use live on the About page, so old links to /terms
// land on that section. replaceUrl keeps /terms out of the back history.
@Component({
  selector: 'app-terms-redirect',
  template: ''
})
export class TermsRedirectComponent {
  constructor(router: Router) {
    router.navigate(['/about'], { fragment: 'terms', replaceUrl: true });
  }
}
