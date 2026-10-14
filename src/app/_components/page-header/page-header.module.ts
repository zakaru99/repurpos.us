import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageHeaderComponent } from './page-header.component';

// Shared so lazy-loaded modules (About) and the root module can both use it
@NgModule({
  imports: [CommonModule],
  declarations: [PageHeaderComponent],
  exports: [PageHeaderComponent]
})
export class PageHeaderModule { }
