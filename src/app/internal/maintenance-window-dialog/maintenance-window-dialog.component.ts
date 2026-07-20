import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MaintenanceWindow } from '../../_models';
import {
  todayInPacificDateString,
  utcIsoToPacificDateAndHour,
  pacificDateAndHourToUtcIso
} from '../../_services';

const HOURS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}));

@Component({
  selector: 'app-maintenance-window-dialog',
  templateUrl: './maintenance-window-dialog.component.html',
  styleUrls: ['./maintenance-window-dialog.component.css']
})
export class MaintenanceWindowDialogComponent implements OnInit {
  readonly hours = HOURS;
  readonly minDate = todayInPacificDateString();

  enabled = true;
  date = this.minDate;
  hour = 9;
  message = '';

  state: 'idle' | 'saving' | 'error' = 'idle';
  errorMessage = '';

  get isEdit(): boolean {
    return !!(this.data && this.data.id);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MaintenanceWindow | null,
    public dialogRef: MatDialogRef<MaintenanceWindowDialogComponent>,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.scheduledStart) {
      const parts = utcIsoToPacificDateAndHour(this.data.scheduledStart);
      this.date = parts.date;
      this.hour = parts.hour;
      this.enabled = this.data.enabled;
      this.message = this.data.message || '';
    }
  }

  save(): void {
    if (this.date < this.minDate) {
      this.errorMessage = 'Scheduled date cannot be in the past.';
      this.state = 'error';
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) { return; }
    this.state = 'saving';
    const payload = {
      enabled: this.enabled,
      scheduledStart: pacificDateAndHourToUtcIso(this.date, this.hour),
      message: this.message || null
    };
    const headers = new HttpHeaders().set('Authorization', token);
    const request$ = this.isEdit
      ? this.http.put(`/api/maintenance_window/${this.data.id}`, payload, { headers })
      : this.http.post('/api/maintenance_window', payload, { headers });

    request$.subscribe({
      next: () => this.dialogRef.close({ saved: true }),
      error: () => {
        this.errorMessage = 'Failed to save. Please try again.';
        this.state = 'error';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
