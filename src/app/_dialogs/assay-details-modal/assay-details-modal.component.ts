import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssayDetails } from '../../_models/index';

@Component({
  selector: 'app-assay-details-modal',
  templateUrl: './assay-details-modal.component.html',
  styleUrls: ['./assay-details-modal.component.scss']
})
export class AssayDetailsModalComponent {
  statusGroupColors: { [key: string]: string } = {
    'Pre-Screen': '#B8C0FF',     // soft indigo
    'Screening': '#7DCBFF',      // soft blue
    'Completed': '#9FD3A6'       // soft green
  };

  statusesGrouped = [
    {
      label: 'Pre-Screen',
      options: [
        'ReFRAME Waiting for MTA',
        'ReFRAME MTA Signed',
        'ReFRAME LOPAC'
      ]
    },
    {
      label: 'Screening',
      options: [
        'ReFRAME Primary Screen Sent',
        'ReFRAME Dose Response Sent',
        'ReFRAME Dose Response Data Received'
      ]
    },
    {
      label: 'Completed',
      options: [
        'ReFRAME Screen Completed',
        'ReFRAME Completed but need milestones',
        'ReFRAME Screen Terminated and Closed'
      ]
    }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      assays: AssayDetails[];
    },
    public dialogRef: MatDialogRef<AssayDetailsModalComponent>
  ) {}

  getStatusColor(status: string): string {
    if (!status) return '#E0E0E0';

    for (const group of this.statusesGrouped) {
      if (group.options.includes(status)) {
        return this.statusGroupColors[group.label] || '#E0E0E0';
      }
    }

    return '#E0E0E0';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
