import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MaintenanceWindow } from '../../_models';
import { formatPacificDisplay } from '../../_services';
import { MaintenanceWindowDialogComponent } from '../maintenance-window-dialog/maintenance-window-dialog.component';

@Component({
  selector: 'app-maintenance-window',
  templateUrl: './maintenance-window.component.html',
  styleUrls: ['./maintenance-window.component.css']
})
export class MaintenanceWindowComponent implements OnInit {
  windows: MaintenanceWindow[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient, private dialog: MatDialog) {}

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
        this.errorMessage = 'Failed to load the maintenance queue.';
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

  addWindow(): void {
    const dialogRef = this.dialog.open(MaintenanceWindowDialogComponent, {
      data: null, width: '500px', panelClass: 'maintenance-window-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.saved) { this.fetchWindows(); }
    });
  }

  editWindow(w: MaintenanceWindow): void {
    const dialogRef = this.dialog.open(MaintenanceWindowDialogComponent, {
      data: w, width: '500px', panelClass: 'maintenance-window-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.saved) { this.fetchWindows(); }
    });
  }

  deleteWindow(w: MaintenanceWindow): void {
    if (!confirm('Delete this scheduled maintenance window?')) { return; }
    const token = localStorage.getItem('auth_token');
    if (!token) { return; }
    this.http.delete(`/api/maintenance_window/${w.id}`, {
      headers: new HttpHeaders().set('Authorization', token)
    }).subscribe({
      next: () => this.fetchWindows(),
      error: () => { this.errorMessage = 'Failed to delete.'; }
    });
  }
}
