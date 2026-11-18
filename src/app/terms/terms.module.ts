import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TermsComponent } from '../_dialogs/terms/terms.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [ TermsComponent ],
  exports: [ TermsComponent ],
  entryComponents: [
    TermsComponent]
})

export class TermsModule { }
