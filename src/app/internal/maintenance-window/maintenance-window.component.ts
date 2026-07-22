import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MaintenanceWindow } from '../../_models';
import {
  formatPacificDisplay,
  todayInPacificDateString,
  utcIsoToPacificDateAndHour,
  pacificDateAndHourToUtcIso
} from '../../_services';

const HOURS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}));

@Component({
  selector: 'app-maintenance-window',
  templateUrl: './maintenance-window.component.html',
  styleUrls: ['./maintenance-window.component.css']
})
export class MaintenanceWindowComponent implements OnInit {
  readonly hours = HOURS;
  readonly minDate = todayInPacificDateString();

  windows: MaintenanceWindow[] = [];
  isLoading = false;
  listError = '';

  editingId: number | null = null;
  enabled = true;
  date = this.minDate;
  hour = 9;
  message = '';

  formState: 'idle' | 'saving' | 'error' = 'idle';
  formError = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchWindows();
  }

  fetchWindows(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) { return; }
    this.isLoading = true;
    this.http.get<{ status: string; data: MaintenanceWindow[] }>('/api/maintenance_window/list', {
      headers: new HttpHeaders().set('Authorization', token)
    }).subscribe({
      next: (res) => {
        this.windows = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.listError = 'Failed to load the maintenance queue.';
        this.isLoading = false;
      }
    });
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
    const token = localStorage.getItem('auth_token');
    if (!token) { return; }
    this.formState = 'saving';
    const payload = {
      enabled: this.enabled,
      scheduledStart: pacificDateAndHourToUtcIso(this.date, this.hour),
      message: this.message || null
    };
    const headers = new HttpHeaders().set('Authorization', token);
    const request$ = this.editingId
      ? this.http.put(`/api/maintenance_window/${this.editingId}`, payload, { headers })
      : this.http.post('/api/maintenance_window', payload, { headers });

    request$.subscribe({
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

  deleteWindow(w: MaintenanceWindow): void {
    if (!confirm('Delete this scheduled maintenance window?')) { return; }
    const token = localStorage.getItem('auth_token');
    if (!token) { return; }
    this.http.delete(`/api/maintenance_window/${w.id}`, {
      headers: new HttpHeaders().set('Authorization', token)
    }).subscribe({
      next: () => {
        if (this.editingId === w.id) { this.resetForm(); }
        this.fetchWindows();
      },
      error: () => { this.listError = 'Failed to delete.'; }
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
