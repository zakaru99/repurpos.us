import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserPortalRoutingModule } from './user-portal-routing.module';
import { MyAssaysComponent } from './my-assays/my-assays.component';
import { UserPortalLayoutComponent } from './user-portal-layout/user-portal-layout.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { MyFavoritesComponent } from './my-favorites/my-favorites.component';
import { MyListsComponent } from './my-lists/my-lists.component';

const routes: Routes = [
  { path: '', component: UserPortalLayoutComponent }
];

@NgModule({
  imports: [
    CommonModule,
    UserPortalRoutingModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    MyAssaysComponent,
    UserPortalLayoutComponent,
    MyAccountComponent,
    MyFavoritesComponent,
    MyListsComponent
  ]
})
export class UserPortalModule { }
