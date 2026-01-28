import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router, NavigationEnd } from '@angular/router';

import { IntroTextComponent } from './intro-text/intro-text.component';
import { IntroTextModernComponent } from './intro-text-modern/intro-text-modern.component';
import { CompoundSearchComponent } from './compound-search/compound-search.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TermsComponent } from "./_dialogs/terms/terms.component";
import { WorkflowComponent } from "./workflow/workflow.component";
import { OntologyTreeComponent } from "./ontology-tree/ontology-tree.component";
import { ContactUsComponent } from './contact-us/contact-us.component';
import { environment } from '../environments/environment';
import { AdminGuard } from './_guards/admin.guard';
import { AssayProposalComponent } from './assay-proposal/assay-proposal.component';

const appRoutes: Routes = [
  { path: '', component: IntroTextModernComponent, pathMatch: 'full' },
  { path: 'terms', component: TermsComponent, pathMatch: 'full' },
  { path: 'search', component: CompoundSearchComponent, pathMatch: 'full' },
  { path: 'about', pathMatch: 'full', loadChildren: () => import('./about/about.module').then(mod => mod.AboutModule) },
  { path: 'workflow', component: WorkflowComponent, pathMatch: 'full' },
  {
    path: 'assays', pathMatch: 'full',
    loadChildren: () => import('./assays/assays.module').then(mod => mod.AssaysModule)
  },
  { path: 'ontology-tree', component: OntologyTreeComponent, pathMatch: 'full' },
  {
    path: 'assays/:aid', pathMatch: 'full',
    loadChildren: () => import('./assay-data/assay-data.module').then(mod => mod.AssayDataModule)
  },

  {
    path: 'compound_data/:id', runGuardsAndResolvers: 'always',
    loadChildren: () => import('./compound-data/compound-data.module').then(mod => mod.CompoundDataModule)
  },
  { path: 'confirm/:cid', component: ConfirmEmailComponent, pathMatch: 'full' },
  { path: 'reset_pass/:rid', component: ResetPasswordComponent, pathMatch: 'full' },
  { path: 'contact-us', component: ContactUsComponent, pathMatch: 'full'},
  { path: 'assay_proposal', component: AssayProposalComponent, pathMatch: 'full' },
  { path: 'internal', loadChildren: () => import('./internal/internal.module').then(mod => mod.InternalModule), canActivate:[AdminGuard]},
  { 
    path: 'user_portal', 
    loadChildren: () => import('./user-portal/user-portal.module').then(m => m.UserPortalModule),
    // canActivate: [UserGuard]   // we'll create this guard
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private router: Router) {
    // Send page change event to google analytics
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).ga('set', 'page', event.urlAfterRedirects);
        (<any>window).ga('send', 'pageview');
      }
    });
  }
}

export const routedComponents = [CompoundSearchComponent, ConfirmEmailComponent, ResetPasswordComponent];
