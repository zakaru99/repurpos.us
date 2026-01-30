import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InternalLayoutComponent } from './internal-layout/internal-layout.component';
import { ProposalListComponent } from './proposal-list/proposal-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
const routes: Routes = [
  {
    path: '',
    component: InternalLayoutComponent,
    children: [
      { path: 'proposals', component: ProposalListComponent },
      { path: 'dashboard', component: DashboardComponent},
      { path: 'user_management', component: UserManagementComponent}
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InternalRoutingModule { }
