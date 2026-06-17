import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CompoundService } from '../../_services';
import { LoginStateService } from '../../_services/login-state.service';
import { LoginState } from '../../_models/index';

interface PdfEntry {
  label: string;
  url: SafeResourceUrl;
  href: string;
}

@Component({
  selector: 'app-compound-synthetic-route',
  templateUrl: './compound-synthetic-route.component.html',
  styleUrls: ['./compound-synthetic-route.component.scss']
})
export class CompoundSyntheticRouteComponent implements OnInit {

  pdfEntries: PdfEntry[] = [];
  loggedIn: boolean = false;
  expanded: boolean = false;
  private currentIkey: string = '';
  private availableIkeys: Set<string> = new Set();

  constructor(
    private cmpdSvc: CompoundService,
    private loginStateService: LoginStateService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loginStateService.isUserLoggedIn.subscribe((logState: LoginState) => {
      this.loggedIn = logState.loggedIn;
    });

    this.http.get<string[]>('assets/synthetic_routes/index.json').subscribe(
      (ikeys: string[]) => {
        this.availableIkeys = new Set(ikeys);
        this.updatePdfEntries();
      },
      () => {}
    );

    this.cmpdSvc.idStates.subscribe((idObj: any) => {
      this.currentIkey = (idObj && idObj['id']) ? idObj['id'] : '';
      this.expanded = false;
      this.updatePdfEntries();
    });
  }

  private updatePdfEntries() {
    if (!this.currentIkey) {
      this.pdfEntries = [];
      return;
    }

    const entries: PdfEntry[] = [];

    for (const key of Array.from(this.availableIkeys)) {
      if (key !== this.currentIkey && !key.startsWith(this.currentIkey + '-')) {
        continue;
      }
      const path = `assets/synthetic_routes/${key}.pdf`;
      const suffix = key.slice(this.currentIkey.length + 1); // '' for exact match
      const label = suffix
        ? suffix.charAt(0).toUpperCase() + suffix.slice(1)
        : 'Compound';

      entries.push({
        label,
        url: this.sanitizer.bypassSecurityTrustResourceUrl(`${path}#navpanes=0`),
        href: path
      });
    }

    // Exact match first, variants after
    entries.sort((a, b) => {
      if (a.label === 'Compound') return -1;
      if (b.label === 'Compound') return 1;
      return a.label.localeCompare(b.label);
    });

    this.pdfEntries = entries;
  }
}
