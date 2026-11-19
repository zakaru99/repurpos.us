import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { StructureSvgService } from '../_services/index';

// One 2D structure drawing. Shared by REFRAMEdb and CRESTdb (keep the two
// copies identical). The SVG goes into the page inline, not as an <img>, so
// the page's styles reach it (substructure highlights, bond colour) and
// already-drawn SVG (struct_type="svg") can be shown as is. It scales to fit
// .svg-wrapper; callers set that box's height.
//
// struct_type: 'smiles' | 'inchikey' | ... (drawn by the API), or 'svg' when
// `structure` is SVG markup already.
@Component({
  selector: 'app-struct2d',
  templateUrl: './struct2d.component.html',
  styleUrls: ['./struct2d.component.scss']
})
export class Struct2dComponent implements OnChanges, OnDestroy {
  @Input() smiles: string;
  @Input() structure: string;
  @Input() struct_type: string;
  @Input() launch_search = true;
  // Offer the drawing as an SVG file (replaces right-click "Save image")
  @Input() downloadable = false;
  // For the accessible label and the download's file name
  @Input() name = '';

  svg: SafeHtml = null;
  raw: string = null;
  showMyElement: boolean;
  private sub: Subscription;

  constructor(private domSanitizer: DomSanitizer, private svgSvc: StructureSvgService) { }

  ngOnChanges() {
    if (this.sub) { this.sub.unsubscribe(); this.sub = null; }
    if (!this.structure) {
      this.set(null);
    } else if (this.struct_type === 'svg') {
      this.set(this.structure);
    } else {
      this.sub = this.svgSvc.getSVG(this.structure, this.struct_type).subscribe(
        (markup: string) => this.set(markup),
        () => this.set(null)
      );
    }
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }

  get label(): string {
    return this.name ? '2D structure of ' + this.name : '2D structure';
  }

  get fileName(): string {
    const base = (this.name || this.smiles || 'structure').replace(/[^\w.-]+/g, '_').slice(0, 80);
    return base + '.svg';
  }

  download() {
    if (!this.raw) { return; }
    const blob = new Blob([this.raw], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = this.fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); });
  }

  private set(markup: string) {
    this.raw = markup || null;
    this.svg = markup ? this.domSanitizer.bypassSecurityTrustHtml(markup) : null;
  }
}
