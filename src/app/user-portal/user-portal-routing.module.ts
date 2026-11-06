import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserPortalLayoutComponent } from './user-portal-layout/user-portal-layout.component';
import { MyAssaysComponent } from './my-assays/my-assays.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { MyFavoritesComponent } from './my-favorites/my-favorites.component';
import { MyListsComponent } from './my-lists/my-lists.component';
import { ScreenPreviewComponent } from './screen-preview/screen-preview.component';

const routes: Routes = [
  {
    path: '',
    component: UserPortalLayoutComponent,
    children: [
      { path: 'my_assays', component: MyAssaysComponent },
      { path: 'my_account', component: MyAccountComponent },
      { path: 'my_favorites', component: MyFavoritesComponent },
      { path: 'my_lists', component: MyListsComponent },
      // PREVIEW: a screen as one record (sample data, works signed out)
      { path: 'screens', component: ScreenPreviewComponent },
      { path: '', redirectTo: 'my_account', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPortalRoutingModule { }
