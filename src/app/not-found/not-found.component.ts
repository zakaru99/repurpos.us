import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Shown for any address the router doesn't know (the '**' route): the site's
// navy page band saying what happened, then the main places to go instead.
@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  path: string;

  constructor(router: Router) {
    this.path = router.url.split(/[?#]/)[0];
  }
}
