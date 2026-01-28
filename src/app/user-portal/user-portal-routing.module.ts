import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserPortalLayoutComponent } from './user-portal-layout/user-portal-layout.component';
import { MyAssaysComponent } from './my-assays/my-assays.component';
const routes: Routes = [
  {
    path: '',
    component: UserPortalLayoutComponent,
    children: [
      { path: 'my_assays', component: MyAssaysComponent }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPortalRoutingModule { }
