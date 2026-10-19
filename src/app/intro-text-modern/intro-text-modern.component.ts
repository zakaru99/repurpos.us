import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { HOME_DATA } from './home-data';
import { HomeDataService } from './home-data.service';
import { PARTNERSHIP_STEPS } from '../_models/partnership-steps';

interface Bar { label: string; value: number; }

// Figures, chart data and release notes live in home-data.ts so a data
// release only means editing that file.
const DATA: any = HOME_DATA;

@Component({
  selector: 'app-intro-text-modern',
  templateUrl: './intro-text-modern.component.html',
  styleUrls: ['./intro-text-modern.component.scss']
})
export class IntroTextModernComponent implements OnInit {
  stats = DATA.stats;
  lastUpdated = new Date(DATA.stats.lastUpdated);
  moaCategories: Bar[] = DATA.moaCategories;
  ontologies: Bar[] = DATA.ontologies;
  phases: { placeholder: boolean; items: Bar[] } = DATA.phases;
  assayFormats: Bar[] = DATA.assayFormats;

  whatsNewItems: Array<{ date: Date; text: string }> =
    DATA.whatsNew.map((n: [string, string]) => ({ date: new Date(n[0]), text: n[1] }));
  isWhatsNewOpen = false;
  @ViewChild('wnTrigger') wnTrigger: ElementRef;
  @ViewChild('drawerClose') drawerClose: ElementRef;

  readonly downloads = {
    compounds: { url: 'assets/csv/reframe_smiles_list.csv', file: 'reframe_smiles_list.csv', size: null as number },
    screening: { url: 'assets/csv/reframe_assay_data.zip', file: 'reframe_assay_data.zip', size: null as number }
  };

  partnershipSteps = PARTNERSHIP_STEPS;

  constructor(private data: HomeDataService) { }

  ngOnInit() {
    for (const key of Object.keys(this.downloads)) {
      const d = this.downloads[key];
      this.data.getFileSize(d.url).subscribe(size => d.size = size);
    }
  }

  barWidth(value: number, items: Bar[]): number {
    const max = Math.max(1, ...items.map(i => i.value));
    return value / max * 100;
  }

  get phaseTotal(): number {
    return this.phases.items.reduce((sum, i) => sum + i.value, 0);
  }

  get groupedItems(): Array<{ label: string; items: Array<{ date: Date; text: string }> }> {
    const groups: { [key: string]: Array<{ date: Date; text: string }> } = {};
    const order: string[] = [];
    for (const item of this.whatsNewItems) {
      const label = item.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[label]) { groups[label] = []; order.push(label); }
      groups[label].push(item);
    }
    return order.map(label => ({ label, items: groups[label] }));
  }

  openWhatsNew(ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    this.isWhatsNewOpen = true;
    // Wait for the drawer's visibility transition to start before focusing into it
    setTimeout(() => this.drawerClose && this.drawerClose.nativeElement.focus(), 50);
  }

  closeWhatsNew() {
    if (!this.isWhatsNewOpen) { return; }
    this.isWhatsNewOpen = false;
    if (this.wnTrigger) { this.wnTrigger.nativeElement.focus(); }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeWhatsNew();
  }

  download(d: { url: string; file: string }) {
    const link = document.createElement('a');
    link.href = d.url;
    link.download = d.file;
    link.click();
  }

  formatSize(bytes: number): string {
    if (bytes == null) { return ''; }
    return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  }
}
