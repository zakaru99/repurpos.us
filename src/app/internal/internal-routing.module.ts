import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InternalLayoutComponent } from './internal-layout/internal-layout.component';
import { ProposalListComponent } from './proposal-list/proposal-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { MaintenanceWindowComponent } from './maintenance-window/maintenance-window.component';
import { AdminGuard } from '../_guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: InternalLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'proposals', component: ProposalListComponent, data: { title: 'Proposals | Admin' } },
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Overview | Admin' } },
      // Admin-only; reviewers get Overview and Proposals
      { path: 'user_management', component: UserManagementComponent, canActivate: [AdminGuard], data: { title: 'Access | Admin' } },
      { path: 'maintenance_window', component: MaintenanceWindowComponent, canActivate: [AdminGuard], data: { title: 'Maintenance | Admin' } }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InternalRoutingModule { }
