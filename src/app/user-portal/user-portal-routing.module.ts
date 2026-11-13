import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserPortalLayoutComponent } from './user-portal-layout/user-portal-layout.component';
import { MyAssaysComponent } from './my-assays/my-assays.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { MyFavoritesComponent } from './my-favorites/my-favorites.component';
import { MyListsComponent } from './my-lists/my-lists.component';

const routes: Routes = [
  {
    path: '',
    component: UserPortalLayoutComponent,
    children: [
      { path: 'my_assays', component: MyAssaysComponent, data: { title: 'your proposals' } },
      { path: 'my_account', component: MyAccountComponent, data: { title: 'your account' } },
      { path: 'my_favorites', component: MyFavoritesComponent, data: { title: 'your favorites' } },
      { path: 'my_lists', component: MyListsComponent, data: { title: 'your lists' } },
      { path: '', redirectTo: 'my_account', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPortalRoutingModule { }
