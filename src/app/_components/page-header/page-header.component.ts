import { Component, HostListener, Input, OnChanges } from '@angular/core';

export interface PageSection {
  id: string;     // element id of the section on the page
  label: string;
}

// Header for content pages (About, Workflow, Contact): a navy band in the
// homepage hero's style with an eyebrow, title and lede, plus an optional
// in-page section nav. The nav strip is sticky under the site header (see
// "Sub-headers are always sticky" in DESIGN.md) and highlights the section
// currently in view.
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnChanges {
  @Input() eyebrow: string;
  @Input() title: string;
  @Input() lede: string;
  @Input() sections: PageSection[] = [];

  active: string = null;

  ngOnChanges() {
    this.active = this.sections && this.sections.length ? this.sections[0].id : null;
  }

  go(section: PageSection, event: Event) {
    event.preventDefault();
    const el = document.getElementById(section.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + section.id);
      this.active = section.id;
    }
  }

  // The last section whose top has passed the sticky headers is "current"
  @HostListener('window:scroll')
  onScroll() {
    if (!this.sections || !this.sections.length) { return; }
    const offset = this.stickyOffset() + 24;
    let current = this.sections[0].id;
    for (const s of this.sections) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= offset) { current = s.id; }
    }
    // At the very bottom of the page, the last section counts as current
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = this.sections[this.sections.length - 1].id;
    }
    this.active = current;
  }

  private stickyOffset(): number {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--site-header-height');
    return (parseInt(v, 10) || 65) + 46;
  }
}
