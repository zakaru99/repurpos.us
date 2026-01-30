import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InternalRoutingModule } from './internal-routing.module';
import { InternalLayoutComponent } from './internal-layout/internal-layout.component';
import { ProposalListComponent } from './proposal-list/proposal-list.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProposalDetailDialogComponent } from './proposal-detail-dialog/proposal-detail-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';

@NgModule({
  imports: [
    CommonModule,
    InternalRoutingModule,
    MatToolbarModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule
  ],
  declarations: [InternalLayoutComponent, ProposalListComponent, ProposalDetailDialogComponent, DashboardComponent, UserManagementComponent],
  entryComponents: [
    ProposalDetailDialogComponent
  ],
})
export class InternalModule { }
