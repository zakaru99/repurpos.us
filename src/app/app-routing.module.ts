import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { IntroTextComponent } from './intro-text/intro-text.component';
import { IntroTextModernComponent } from './intro-text-modern/intro-text-modern.component';
import { CompoundSearchComponent } from './compound-search/compound-search.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TermsRedirectComponent } from "./terms/terms-redirect.component";
import { WorkflowComponent } from "./workflow/workflow.component";
import { OntologyTreeComponent } from "./ontology-tree/ontology-tree.component";
import { ContactUsComponent } from './contact-us/contact-us.component';
import { environment } from '../environments/environment';
import { PortalGuard } from './_guards/admin.guard';
import { AssayProposalComponent } from './assay-proposal/assay-proposal.component';
import { NotFoundComponent } from './not-found/not-found.component';

const appRoutes: Routes = [
  { path: '', component: IntroTextModernComponent, pathMatch: 'full' },
  { path: 'terms', component: TermsRedirectComponent, pathMatch: 'full' },
  { path: 'search', component: CompoundSearchComponent, pathMatch: 'full', data: { title: 'search' } },
  { path: 'about', pathMatch: 'full', data: { title: 'about' }, loadChildren: () => import('./about/about.module').then(mod => mod.AboutModule) },
  { path: 'workflow', component: WorkflowComponent, pathMatch: 'full', data: { title: 'workflow' } },
  {
    path: 'assays', pathMatch: 'full', data: { title: 'assays' },
    loadChildren: () => import('./assays/assays.module').then(mod => mod.AssaysModule)
  },
  { path: 'ontology-tree', component: OntologyTreeComponent, pathMatch: 'full', data: { title: 'ontology tree' } },
  {
    path: 'assays/:aid', pathMatch: 'full', data: { title: 'assay' },
    loadChildren: () => import('./assay-data/assay-data.module').then(mod => mod.AssayDataModule)
  },

  {
    path: 'compound_data/:id', runGuardsAndResolvers: 'always', data: { title: 'compound' },
    loadChildren: () => import('./compound-data/compound-data.module').then(mod => mod.CompoundDataModule)
  },
  { path: 'confirm/:cid', component: ConfirmEmailComponent, pathMatch: 'full', data: { title: 'confirm email' } },
  { path: 'reset_pass/:rid', component: ResetPasswordComponent, pathMatch: 'full', data: { title: 'reset password' } },
  { path: 'contact-us', component: ContactUsComponent, pathMatch: 'full', data: { title: 'contact' } },
  { path: 'assay_proposal', component: AssayProposalComponent, pathMatch: 'full', data: { title: 'propose an assay' } },
  { path: 'internal', loadChildren: () => import('./internal/internal.module').then(mod => mod.InternalModule), canActivate:[PortalGuard]},
  { 
    path: 'user_portal', 
    loadChildren: () => import('./user-portal/user-portal.module').then(m => m.UserPortalModule),
    // canActivate: [UserGuard]   // we'll create this guard
  },
  // Anything else: a not-found page instead of a blank screen. Keep last.
  { path: '**', component: NotFoundComponent, data: { title: 'page not found' } },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  private lastPath: string;

  constructor(private router: Router, private titleService: Title) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setTitle(event.urlAfterRedirects);

        // Send page change event to google analytics
        (<any>window).ga('set', 'page', event.urlAfterRedirects);
        (<any>window).ga('send', 'pageview');
      }
    });
  }

  // Each page gets "<route data title> | reframeDB", or plain "reframeDB",
  // so the tab never keeps the previous page's title. Pages with a title
  // from their data (compound, assay, search, assays) set it themselves after
  // this runs. Query or fragment changes on the same page leave it alone.
  private setTitle(url: string) {
    const path = url.split(/[?#]/)[0];
    if (path === this.lastPath) {
      return;
    }
    this.lastPath = path;

    let title: string = null;
    let route = this.router.routerState.snapshot.root;
    while (route) {
      if (route.data && route.data.title) {
        title = route.data.title;
      }
      route = route.firstChild;
    }
    this.titleService.setTitle(title ? `${title} | reframeDB` : 'reframeDB');
  }
}

export const routedComponents = [CompoundSearchComponent, ConfirmEmailComponent, ResetPasswordComponent];
