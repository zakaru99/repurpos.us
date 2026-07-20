import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MaintenanceWindow } from '../../_models';
import { utcIsoToPacificDateTimeLocal as toLocal, pacificDateTimeLocalToUtcIso as toUtc } from '../../_services';

@Component({
  selector: 'app-maintenance-window',
  templateUrl: './maintenance-window.component.html',
  styleUrls: ['./maintenance-window.component.css']
})
export class MaintenanceWindowComponent implements OnInit {
  state: 'loading' | 'idle' | 'saving' | 'saved' | 'error' = 'loading';
  errorMessage = '';

  enabled = false;
  scheduledStartLocal = '';
  message = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<MaintenanceWindow>('/api/maintenance_window').subscribe({
      next: (res) => {
        this.enabled = !!res.enabled;
        this.scheduledStartLocal = res.scheduledStart ? toLocal(res.scheduledStart) : '';
        this.message = res.message || '';
        this.state = 'idle';
      },
      error: () => {
        this.errorMessage = 'Failed to load the current maintenance schedule.';
        this.state = 'error';
      }
    });
  }

  save(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) { return; }
    this.state = 'saving';
    const payload = {
      enabled: this.enabled,
      scheduledStart: this.scheduledStartLocal ? toUtc(this.scheduledStartLocal) : null,
      message: this.message || null
    };
    this.http.post('/api/maintenance_window', payload, {
      headers: new HttpHeaders().set('Authorization', token)
    }).subscribe({
      next: () => { this.state = 'saved'; },
      error: () => {
        this.errorMessage = 'Failed to save the maintenance schedule.';
        this.state = 'error';
      }
    });
  }
}
