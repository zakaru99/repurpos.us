import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MaintenanceWindow } from '../../_models';
import { formatPacificDisplay } from '../../_services';

const DISMISSED_KEY = 'reframedb.maintenanceNotice.dismissedFor';
const GRACE_HOURS = 12;

@Component({
  selector: 'app-maintenance-banner',
  templateUrl: './maintenance-banner.component.html',
  styleUrls: ['./maintenance-banner.component.scss']
})
export class MaintenanceBannerComponent implements OnInit {
  visible = false;
  displayText = '';
  postedText = '';

  private scheduledStart: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<MaintenanceWindow>('/api/maintenance_window').subscribe({
      next: (notice) => this.applyNotice(notice),
      error: () => { /* decorative feature — never break the app on fetch failure */ }
    });
  }

  dismiss(): void {
    if (this.scheduledStart) {
      localStorage.setItem(DISMISSED_KEY, this.scheduledStart);
    }
    this.visible = false;
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
    if (localStorage.getItem(DISMISSED_KEY) === notice.scheduledStart) {
      return;
    }

    this.scheduledStart = notice.scheduledStart;
    this.displayText = notice.message && notice.message.trim()
      ? notice.message
      : `Scheduled maintenance ${formatPacificDisplay(notice.scheduledStart)} — the site will be down for a few hours.`;
    this.postedText = notice.postedAt ? `Posted ${formatPacificDisplay(notice.postedAt)}` : '';
    this.visible = true;
  }
}
