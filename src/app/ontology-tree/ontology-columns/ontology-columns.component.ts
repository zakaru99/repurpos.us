import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { HomeDataService } from '../../intro-text-modern/home-data.service';
import { exportCompoundsCsv, holdsCompounds } from '../ontology-export';

// Finder-style column browser for one ontology. Each selection opens the
// node's children in the next column; selecting a compound opens a detail pane.
@Component({
  selector: 'app-ontology-columns',
  templateUrl: './ontology-columns.component.html',
  styleUrls: ['./ontology-columns.component.scss']
})
export class OntologyColumnsComponent implements OnChanges, AfterViewInit {
  @Input() root: any;
  // Node id to reveal (from search); the browser opens the path down to it
  @Input() revealId: number;

  @ViewChild('scroller') scroller: ElementRef;
  @ViewChild('crumbs') crumbsEl: ElementRef;

  path: any[] = [];          // selected node per column, root's child first
  structure$: Observable<SafeUrl>;

  // Layout: on wide screens show only the most recent columns that fit beside
  // the detail pane; earlier levels fold into a strip on the left
  private readonly COLUMN_W = 300;
  private readonly DETAIL_W = 360;
  private readonly STRIP_W = 56;
  private width = 1200;

  private counts = new Map<any, number>();
  private parents = new Map<any, any>();

  constructor(private data: HomeDataService, private host: ElementRef) { }

  ngAfterViewInit() {
    setTimeout(() => this.measure());
  }

  @HostListener('window:resize')
  measure() {
    this.width = this.host.nativeElement.offsetWidth || this.width;
  }

  get compact(): boolean {
    return this.width < 640;
  }

  // Index of the first column shown; columns before it are folded away
  get firstVisible(): number {
    const total = this.columns.length;
    if (this.compact) { return 0; }
    const room = this.width - (this.selected ? this.DETAIL_W : 0);
    let fit = Math.max(1, Math.floor(room / this.COLUMN_W));
    if (fit < total) {
      // the strip takes some room once anything is folded
      fit = Math.max(1, Math.floor((room - this.STRIP_W) / this.COLUMN_W));
    }
    return Math.max(0, total - fit);
  }

  get visibleColumns(): Array<{ items: any[]; index: number }> {
    const start = this.firstVisible;
    return this.columns.slice(start).map((items, i) => ({ items, index: start + i }));
  }

  trackCol(_: number, col: { index: number }) {
    return col.index;
  }

  // Step back one level (from the folded strip)
  back() {
    if (this.path.length) {
      this.path = this.path.slice(0, -1);
      this.structure$ = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.root && this.root) {
      this.counts.clear();
      this.parents.clear();
      this.index(this.root, null);
      this.path = [];
      this.structure$ = null;
    }
    if ((changes.revealId || changes.root) && this.revealId != null && this.root) {
      this.reveal(this.revealId);
    }
  }

  // ---------------------------------------------------------------- data

  get columns(): any[][] {
    const cols = [this.root.children || []];
    for (const node of this.path) {
      if (this.isCategory(node)) { cols.push(node.children); }
    }
    return cols;
  }

  get selected(): any {
    return this.path.length ? this.path[this.path.length - 1] : null;
  }

  get selectedCompound(): any {
    const s = this.selected;
    return s && !this.isCategory(s) ? s : null;
  }

  get selectedParent(): any {
    return this.selected ? this.parents.get(this.selected) : null;
  }

  isCategory(node: any): boolean {
    return !!(node.children && node.children.length);
  }

  holdsCompounds(node: any): boolean {
    return holdsCompounds(node);
  }

  count(node: any): number {
    return this.counts.get(node) || 0;
  }

  isInPath(node: any, col: number): boolean {
    return this.path[col] === node;
  }

  // Distinct compounds under each node, and a parent lookup, built once per ontology
  private index(node: any, parent: any): Set<string> {
    this.parents.set(node, parent);
    const kids = node.children || [];
    const keys = new Set<string>();
    if (!kids.length && node.inchikey) { keys.add(node.inchikey); }
    for (const k of kids) {
      this.index(k, node).forEach(x => keys.add(x));
    }
    this.counts.set(node, keys.size);
    return keys;
  }

  // ---------------------------------------------------------------- interaction

  select(node: any, col: number) {
    this.path = this.path.slice(0, col).concat(node);
    this.structure$ = !this.isCategory(node) && node.smiles
      ? this.data.getStructure(String(node.smiles).split(';')[0].trim())
      : null;
    this.scrollToEnd();
  }

  crumb(i: number) {
    this.path = this.path.slice(0, i + 1);
    this.structure$ = null;
    this.scrollToEnd();
  }

  resetPath() {
    this.path = [];
    this.structure$ = null;
  }

  download(node: any) {
    exportCompoundsCsv(node, this.parents.get(node));
  }

  compoundLink(node: any): string[] {
    return ['/compound_data', String(node.inchikey).substring(0, 14)];
  }

  // Finder keys: up/down within a column, right to open, left to go back
  onKey(event: KeyboardEvent) {
    const col = Math.max(0, this.path.length - 1);
    const items = this.columns[col] || [];
    const current = this.path[col];
    const i = items.indexOf(current);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.select(items[Math.min(items.length - 1, i + 1)] || items[0], col);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.select(items[Math.max(0, i - 1)] || items[0], col);
        break;
      case 'ArrowRight':
        if (current && this.isCategory(current)) {
          event.preventDefault();
          this.select(current.children[0], col + 1);
        }
        break;
      case 'ArrowLeft':
        if (this.path.length > 1) {
          event.preventDefault();
          this.path = this.path.slice(0, -1);
          this.structure$ = null;
        }
        break;
    }
    this.scrollSelectedIntoView();
  }

  private reveal(id: number) {
    const target = this.find(this.root, id);
    if (!target) { return; }
    const chain = [];
    for (let n = target; n && n !== this.root; n = this.parents.get(n)) { chain.unshift(n); }
    this.path = [];
    chain.forEach((n, i) => this.select(n, i));
  }

  private find(node: any, id: number): any {
    if (node.id == id) { return node; }
    for (const k of node.children || []) {
      const hit = this.find(k, id);
      if (hit) { return hit; }
    }
    return null;
  }

  private scrollToEnd() {
    setTimeout(() => {
      const el = this.scroller && this.scroller.nativeElement;
      // Only the phone layout scrolls sideways; wide layouts fold instead
      if (el && this.compact) { el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' }); }
      // Keep the current item visible at the end of a long breadcrumb
      const crumbs = this.crumbsEl && this.crumbsEl.nativeElement;
      if (crumbs) { crumbs.scrollLeft = crumbs.scrollWidth; }
      this.scrollSelectedIntoView();
    });
  }

  // Scroll each column vertically so its selected row is visible, without
  // moving the page or the column strip
  private scrollSelectedIntoView() {
    setTimeout(() => {
      const el = this.scroller && this.scroller.nativeElement;
      if (!el) { return; }
      el.querySelectorAll('.column').forEach((col: HTMLElement) => {
        const row = col.querySelector('.item.selected') as HTMLElement;
        if (!row) { return; }
        const top = row.offsetTop - col.offsetTop;
        if (top < col.scrollTop || top + row.offsetHeight > col.scrollTop + col.clientHeight) {
          col.scrollTop = top - col.clientHeight / 2 + row.offsetHeight / 2;
        }
      });
    });
  }
}
