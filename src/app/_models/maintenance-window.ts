export interface MaintenanceWindow {
  id?: number;
  enabled: boolean;
  scheduledStart: string | null;
  message?: string | null;
}
