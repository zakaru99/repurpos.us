import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserPortalRoutingModule } from './user-portal-routing.module';
import { MyAssaysComponent } from './my-assays/my-assays.component';
import { UserPortalLayoutComponent } from './user-portal-layout/user-portal-layout.component';

const routes: Routes = [
  { path: '', component: UserPortalLayoutComponent }
];

@NgModule({
  imports: [
    CommonModule,
    UserPortalRoutingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MyAssaysComponent, UserPortalLayoutComponent]
})
export class UserPortalModule { }
