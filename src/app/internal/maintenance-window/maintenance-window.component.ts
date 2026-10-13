import { Component, OnInit } from '@angular/core';
import { MaintenanceWindow } from '../../_models';
import {
  formatPacificDisplay,
  todayInPacificDateString,
  utcIsoToPacificDateAndHour,
  pacificDateAndHourToUtcIso
} from '../../_services';
import { AdminApiService } from '../admin-api.service';

const HOURS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}));

@Component({
  selector: 'app-maintenance-window',
  templateUrl: './maintenance-window.component.html',
  styleUrls: ['./maintenance-window.component.scss']
})
export class MaintenanceWindowComponent implements OnInit {
  readonly hours = HOURS;
  readonly minDate = todayInPacificDateString();

  windows: MaintenanceWindow[] = [];
  // Past windows pile up over time; show the most recent few unless asked
  readonly pastLimit = 5;
  showOlder = false;
  isLoading = false;
  listError = '';

  editingId: number | null = null;
  confirmDeleteId: number | null = null;
  enabled = true;
  date = this.minDate;
  hour = 9;
  message = '';
  formState: 'idle' | 'saving' | 'error' = 'idle';
  formError = '';

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.fetchWindows();
  }

  fetchWindows(): void {
    if (!localStorage.getItem('auth_token')) { return; }
    this.isLoading = true;
    this.listError = '';
    this.api.getMaintenanceWindows().subscribe({
      next: list => {
        // Upcoming first (soonest at the top), then past ones, most recent first
        const now = Date.now();
        const t = (w: MaintenanceWindow) => w.scheduledStart ? new Date(w.scheduledStart).getTime() : 0;
        const upcoming = list.filter(w => t(w) >= now).sort((a, b) => t(a) - t(b));
        const past = list.filter(w => t(w) < now).sort((a, b) => t(b) - t(a));
        this.windows = upcoming.concat(past);
        this.isLoading = false;
      },
      error: () => {
        this.listError = 'Failed to load the maintenance queue.';
        this.isLoading = false;
      }
    });
  }

  get visibleWindows(): MaintenanceWindow[] {
    if (this.showOlder) { return this.windows; }
    const upcoming = this.windows.filter(w => !this.isPast(w));
    const past = this.windows.filter(w => this.isPast(w));
    return upcoming.concat(past.slice(0, this.pastLimit));
  }

  get hiddenCount(): number {
    return this.windows.length - this.visibleWindows.length;
  }

  isPast(w: MaintenanceWindow): boolean {
    return !!w.scheduledStart && new Date(w.scheduledStart).getTime() < Date.now();
  }

  formatScheduled(w: MaintenanceWindow): string {
    return w.scheduledStart ? formatPacificDisplay(w.scheduledStart) : '—';
  }

  formatPosted(w: MaintenanceWindow): string {
    return w.postedAt ? formatPacificDisplay(w.postedAt) : '—';
  }

  startEdit(w: MaintenanceWindow): void {
    this.editingId = w.id;
    this.confirmDeleteId = null;
    this.enabled = w.enabled;
    this.message = w.message || '';
    if (w.scheduledStart) {
      const parts = utcIsoToPacificDateAndHour(w.scheduledStart);
      this.date = parts.date;
      this.hour = parts.hour;
    }
    this.formState = 'idle';
  }

  cancelEdit(): void {
    this.resetForm();
  }

  save(): void {
    if (this.date < this.minDate) {
      this.formError = 'Scheduled date cannot be in the past.';
      this.formState = 'error';
      return;
    }
    if (!localStorage.getItem('auth_token')) { return; }
    this.formState = 'saving';
    const payload = {
      enabled: this.enabled,
      scheduledStart: pacificDateAndHourToUtcIso(this.date, this.hour),
      message: this.message || null
    };
    this.api.saveMaintenanceWindow(this.editingId, payload).subscribe({
      next: () => {
        this.resetForm();
        this.fetchWindows();
      },
      error: () => {
        this.formError = 'Failed to save. Please try again.';
        this.formState = 'error';
      }
    });
  }

  askDelete(w: MaintenanceWindow): void {
    this.confirmDeleteId = w.id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  deleteWindow(w: MaintenanceWindow): void {
    if (!localStorage.getItem('auth_token')) { return; }
    this.api.deleteMaintenanceWindow(w.id).subscribe({
      next: () => {
        this.confirmDeleteId = null;
        if (this.editingId === w.id) { this.resetForm(); }
        this.fetchWindows();
      },
      error: () => {
        this.confirmDeleteId = null;
        this.listError = 'Failed to delete.';
      }
    });
  }

  private resetForm(): void {
    this.editingId = null;
    this.enabled = true;
    this.date = this.minDate;
    this.hour = 9;
    this.message = '';
    this.formState = 'idle';
    this.formError = '';
  }
}
