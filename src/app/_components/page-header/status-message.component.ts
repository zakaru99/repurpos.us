import { Component, Input } from '@angular/core';

// One look for "this part of the page couldn't be shown" messages (a list or
// search that failed to load), so every page words and styles them alike:
//
//   <app-status-message kicker="Temporary problem" title="We couldn't load the assays">
//     <p>Explanation…</p>
//     <ng-container actions><button …>Try again</button></ng-container>
//   </app-status-message>
//
// Whole-page states (not-found, a record that failed) use app-page-header
// instead, so they keep the site's navy page band.
@Component({
  selector: 'app-status-message',
  template: `
    <div class="status" [class.compact]="compact" role="alert">
      <p class="kicker" *ngIf="kicker">{{ kicker }}</p>
      <p class="headline">{{ title }}</p>
      <div class="body"><ng-content></ng-content></div>
      <div class="actions"><ng-content select="[actions]"></ng-content></div>
    </div>
  `,
  styleUrls: ['./status-message.component.scss']
})
export class StatusMessageComponent {
  // Short status in coloured text above the title, e.g. "Temporary problem"
  @Input() kicker: string;
  @Input() title: string;
  // Smaller, for narrow panels (admin Overview)
  @Input() compact = false;
}
