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
      { path: 'proposals', component: ProposalListComponent, data: { title: 'proposals | admin' } },
      { path: 'dashboard', component: DashboardComponent, data: { title: 'overview | admin' } },
      // Admin-only; reviewers get Overview and Proposals
      { path: 'user_management', component: UserManagementComponent, canActivate: [AdminGuard], data: { title: 'access | admin' } },
      { path: 'maintenance_window', component: MaintenanceWindowComponent, canActivate: [AdminGuard], data: { title: 'maintenance | admin' } }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InternalRoutingModule { }
