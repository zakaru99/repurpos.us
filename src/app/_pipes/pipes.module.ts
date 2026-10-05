import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SciItalicizePipe, TitleCasePipe } from '.';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ SciItalicizePipe, TitleCasePipe ],
  exports: [ SciItalicizePipe, TitleCasePipe ]
})

export class PipesModule { }
