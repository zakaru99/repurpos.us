import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from '../_components/page-header/page-header.module';
import { FormsModule } from '@angular/forms';

import { InternalRoutingModule } from './internal-routing.module';
import { InternalLayoutComponent } from './internal-layout/internal-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProposalListComponent } from './proposal-list/proposal-list.component';
import { ProposalDetailComponent } from './proposal-detail/proposal-detail.component';
import { ProposalTableComponent } from './proposal-table/proposal-table.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { MaintenanceWindowComponent } from './maintenance-window/maintenance-window.component';

@NgModule({
  imports: [
    CommonModule,
    PageHeaderModule,
    FormsModule,
    InternalRoutingModule
  ],
  declarations: [
    InternalLayoutComponent,
    DashboardComponent,
    ProposalListComponent,
    ProposalDetailComponent,
    ProposalTableComponent,
    UserManagementComponent,
    MaintenanceWindowComponent
  ]
})
export class InternalModule { }
