import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PageHeaderComponent } from './page-header.component';
import { StatusMessageComponent } from './status-message.component';

// Shared so lazy-loaded modules (About) and the root module can both use it
@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [PageHeaderComponent, StatusMessageComponent],
  exports: [PageHeaderComponent, StatusMessageComponent]
})
export class PageHeaderModule { }
