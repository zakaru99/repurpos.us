import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InternalRoutingModule } from './internal-routing.module';
import { InternalLayoutComponent } from './internal-layout/internal-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProposalListComponent } from './proposal-list/proposal-list.component';
import { ProposalDetailComponent } from './proposal-detail/proposal-detail.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { MaintenanceWindowComponent } from './maintenance-window/maintenance-window.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InternalRoutingModule
  ],
  declarations: [
    InternalLayoutComponent,
    DashboardComponent,
    ProposalListComponent,
    ProposalDetailComponent,
    UserManagementComponent,
    MaintenanceWindowComponent
  ]
})
export class InternalModule { }
