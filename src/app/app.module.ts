import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// --- Angular modules ---
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import 'hammerjs';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import {MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatButtonModule, MatProgressSpinnerModule} from '@angular/material';

// import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// -- Custom modules --
import { RecaptchaModule } from 'ng-recaptcha';
import { MaterialModule } from './material.module';
import { PipesModule } from './_pipes/pipes.module';
import { CitationModule } from './citation/citation.module';
import { Struct2dModule } from './struct2d/struct2d.module';
import { TermsModule } from './terms/terms.module';
import { UserPortalModule } from './user-portal/user-portal.module';

// --- Components ---
import { AppComponent } from './app.component';
import { ForgotPasswordComponent, LoginFailComponent, UserRegistrationComponent } from './_dialogs/index';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { HeaderComponent } from './header/header.component';
import { HeroSearchComponent } from './intro-text-modern/hero-search/hero-search.component';
import { FooterComponent } from './footer/footer.component';
import { IntroTextComponent } from './intro-text/intro-text.component';
import { IntroTextModernComponent } from './intro-text-modern/intro-text-modern.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AssayProposalComponent } from './assay-proposal/assay-proposal.component';

import {
  CompoundSearchComponent, CompoundSearchOptionsComponent, SearchBoxComponent,
  SearchResultComponent, SearchResultsTableComponent, StructureSearchOptionsComponent,
  StructureSearchComponent, TextSearchComponent, KetcherComponent, SearchResultSimilarComponent,
  AssayIndicationComponent,
} from './compound-search/index';
import {
  ForgotPassButtonComponent,
  LoaderComponent,
  QuickSearchComponent, UserLoginComponent,
  UserRegButtonComponent,
  DialogOverviewExample,
  DialogOverviewExampleDialog,
  MenuBarComponent,
  MenubarItemComponent, EditItemComponent, MailSignupDialogComponent, MailSignupComponent
} from './_components/index';


// --- Guards and Interceptors ---
import { AuthGuard } from './_guards/auth.guard';
import { LoaderInterceptorService } from './_interceptors/loader-interceptor.service';

// --- Services ---
import {
  AuthService,
  GoogleAnalyticsService,
  LoaderStateService,
  LoginStateService,
  SearchResultService,
  WDQService,
  StructureService,
  TanimotoScaleService,
  StructureSvgService,
  ColorPaletteService,
  BackendSearchService
} from './_services/index';
import {IndicationsGraphComponent} from "./compound-data/indications-graph/indications-graph.component";
import {ShowMoreButtonComponent, ShowMorePane} from "./compound-data";
import { WorkflowComponent } from './workflow/workflow.component';
import { OntologyTreeComponent } from './ontology-tree/ontology-tree.component';

// import { SearchResultHeaderComponent } from './compound-search/search-result-header/search-result-header.component';
// import { ReframeFilterComponent } from './compound-search/search-result-header/reframe-filter/reframe-filter.component';
// import { AssaysFilterComponent } from './compound-search/search-result-header/assays-filter/assays-filter.component';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MenuBarComponent,
    MenubarItemComponent,
    CompoundSearchComponent,
    SearchResultComponent,
    SearchBoxComponent,
    ConfirmEmailComponent,
    CompoundSearchOptionsComponent,
    AuthGuard,
    DialogOverviewExample,
    DialogOverviewExampleDialog,
    SearchResultsTableComponent,
    SearchResultSimilarComponent,
    UserRegistrationComponent,
    UserLoginComponent,
    UserRegButtonComponent,
    ForgotPassButtonComponent,
    LoginFailComponent,
    LoaderComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    QuickSearchComponent,
    StructureSearchOptionsComponent,
    StructureSearchComponent,
    TextSearchComponent,
    KetcherComponent,
    IntroTextComponent,
    IntroTextModernComponent,
    HeroSearchComponent,
    AssayIndicationComponent,
    FooterComponent,
    EditItemComponent,
    MailSignupDialogComponent,
    MailSignupComponent,
    ShowMorePane,
    ShowMoreButtonComponent,
    IndicationsGraphComponent,
    WorkflowComponent,
    OntologyTreeComponent,
    ContactUsComponent,
    AssayProposalComponent

    // SearchResultHeaderComponent, ReframeFilterComponent, AssaysFilterComponent
  ],
  imports: [
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,

    
    BrowserModule,
    HttpModule,
    HttpClientModule,
    MaterialModule,
    PipesModule,
    CitationModule,
    Struct2dModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    TermsModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaModule.forRoot(),
    UserPortalModule
  ],
  providers: [
    { provide: SearchResultService, useClass: SearchResultService },
    { provide: WDQService, useClass: WDQService },
    { provide: TanimotoScaleService, useClass: TanimotoScaleService },
    { provide: StructureService, useClass: StructureService },
    { provide: BackendSearchService, useClass: BackendSearchService },
    { provide: StructureSvgService, useClass: StructureSvgService },
    { provide: AuthService, useClass: AuthService },
    { provide: ColorPaletteService, useClass: ColorPaletteService },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptorService, multi: true },
    LoaderStateService,
    LoginStateService,
    GoogleAnalyticsService
  ],
  entryComponents: [
    DialogOverviewExample,
    DialogOverviewExampleDialog,
    UserRegistrationComponent,
    LoginFailComponent,
    ForgotPasswordComponent
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
