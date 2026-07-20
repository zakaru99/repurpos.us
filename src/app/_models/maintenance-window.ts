export interface MaintenanceWindow {
  enabled: boolean;
  scheduledStart: string | null;
  message?: string | null;
}
