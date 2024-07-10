import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssayDataRoutingModule } from './assay-data-routing.module';

// --- common helper modules ---
import { PipesModule } from '../_pipes/pipes.module';
import { CitationModule } from '../citation/citation.module';
import { Struct2dModule } from '../struct2d/struct2d.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmbedDatasetMetadataDirective } from '../_services/embed-dataset-metadata.directive';

import {
  AssayDataComponent, AssayPaginationComponent, AssayPlotsComponent, DotPlotComponent,
  CmpdTooltipComponent, AssayDwnldComponent, AssayTypeBtnComponent
} from '../assay-data/index';
import { PsdDwnldComponent } from './psd-dwnld/psd-dwnld.component';

@NgModule({
  imports: [
    CommonModule,
    AssayDataRoutingModule,
    PipesModule,
    CitationModule,
    Struct2dModule,
    NgbModule.forRoot()
  ],
  declarations: [
    AssayDataComponent,
    AssayDwnldComponent,
    AssayTypeBtnComponent,
    AssayPlotsComponent,
    DotPlotComponent,
    AssayPaginationComponent,
    CmpdTooltipComponent,
    EmbedDatasetMetadataDirective,
    PsdDwnldComponent
  ]
})

export class AssayDataModule { }
