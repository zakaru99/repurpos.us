import { Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MaintenanceWindow } from '../../_models';
import { formatPacificDisplay } from '../../_services';
import { SKIP_LOADER_HEADER } from '../../_interceptors/loader-interceptor.service';

const DISMISSED_KEY = 'reframedb.maintenanceNotice.dismissedFor';
const GRACE_HOURS = 12;
// How much of the banner shows below the sticky header, for things fixed
// under the header (the homepage's "What's new" button) to sit below it
const OFFSET_VAR = '--maintenance-banner-offset';

@Component({
  selector: 'app-maintenance-banner',
  templateUrl: './maintenance-banner.component.html',
  styleUrls: ['./maintenance-banner.component.scss']
})
export class MaintenanceBannerComponent implements OnInit, OnDestroy {
  visible = false;
  // When, always shown; then the admin's message or the standard one
  whenText = '';
  displayText = '';
  postedText = '';

  private scheduledStart: string | null = null;

  private stopTracking: () => void = null;

  constructor(private http: HttpClient, private host: ElementRef, private zone: NgZone) {}

  ngOnInit(): void {
    // Quietly: no loading overlay, and nothing at all if it fails
    const headers = new HttpHeaders().set(SKIP_LOADER_HEADER, '1');
    this.http.get<MaintenanceWindow>('/api/maintenance_window', { headers }).subscribe({
      next: (notice) => this.applyNotice(notice),
      error: () => { /* decorative feature — never break the app on fetch failure */ }
    });
  }

  ngOnDestroy(): void {
    this.untrack();
  }

  dismiss(): void {
    if (this.scheduledStart) {
      try { localStorage.setItem(DISMISSED_KEY, this.scheduledStart); } catch (e) { /* storage blocked */ }
    }
    this.visible = false;
    this.untrack();
  }

  // Publishes the banner's visible height below the header on scroll and
  // resize, outside Angular so scrolling doesn't run change detection
  private track(): void {
    const root = document.documentElement;
    const publish = () => {
      const header = parseFloat(getComputedStyle(root).getPropertyValue('--site-header-height')) || 0;
      const bottom = this.host.nativeElement.getBoundingClientRect().bottom;
      root.style.setProperty(OFFSET_VAR, Math.max(0, Math.round(bottom - header)) + 'px');
    };
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', publish, { passive: true } as any);
      window.addEventListener('resize', publish);
      setTimeout(publish);
    });
    // The text can rewrap (fonts loading, the header changing height)
    const RO = (window as any).ResizeObserver;
    const observer = RO ? new RO(publish) : null;
    if (observer) { observer.observe(this.host.nativeElement); }
    this.stopTracking = () => {
      window.removeEventListener('scroll', publish);
      window.removeEventListener('resize', publish);
      if (observer) { observer.disconnect(); }
    };
  }

  private untrack(): void {
    if (this.stopTracking) { this.stopTracking(); this.stopTracking = null; }
    document.documentElement.style.removeProperty(OFFSET_VAR);
  }

  private applyNotice(notice: MaintenanceWindow): void {
    if (!notice || notice.enabled !== true || !notice.scheduledStart) {
      return;
    }
    const start = new Date(notice.scheduledStart);
    if (isNaN(start.getTime())) {
      console.warn('MaintenanceBanner: unparseable scheduledStart', notice.scheduledStart);
      return;
    }
    const hideAfter = start.getTime() + GRACE_HOURS * 3600 * 1000;
    if (Date.now() > hideAfter) {
      return;
    }
    let dismissedFor: string = null;
    try { dismissedFor = localStorage.getItem(DISMISSED_KEY); } catch (e) { /* storage blocked */ }
    if (dismissedFor === notice.scheduledStart) {
      return;
    }

    this.scheduledStart = notice.scheduledStart;
    this.whenText = formatPacificDisplay(notice.scheduledStart);
    this.displayText = notice.message && notice.message.trim()
      ? notice.message
      : 'The site will be down for a few hours.';
    this.postedText = notice.postedAt ? `Posted ${formatPacificDisplay(notice.postedAt)}` : '';
    this.visible = true;
    this.track();
  }
}
