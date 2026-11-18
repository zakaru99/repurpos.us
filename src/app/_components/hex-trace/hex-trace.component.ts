import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';

// Points of light that travel right to left along the hero's
// hexagon lattice (hex-lattice in _design.scss): a burst on page load, then a
// single pulse every few seconds at a random height. Each is soft from the
// start and dims as it goes. Each route is a random walk over the lattice's
// real edges, so the light stays on the lines.
//
// Lattice tile (31.18 x 54, origin at the host's top-left): a pointy-top
// hexagon with vertices at y = 0, 9, 27, 36 plus a vertical bond from the
// bottom vertex (y = 36) to the next tile's top vertex (y = 54).

const HALF = 15.59;          // half the tile width
const TILE_H = 54;
const LEVEL_Y = [0, 9, 27, 36];

interface Vertex { cx: number; j: number; lvl: number; }   // x = cx * HALF

const SVG_NS = 'http://www.w3.org/2000/svg';

@Component({
  selector: 'app-hex-trace',
  template: '',
  styleUrls: ['./hex-trace.component.scss']
})
export class HexTraceComponent implements AfterViewInit, OnDestroy {
  private timer: any;
  private svg: SVGSVGElement;
  private destroyed = false;

  // Gap between the follow-up pulses, in ms
  private readonly AMBIENT_MIN = 3000;
  private readonly AMBIENT_MAX = 7000;

  constructor(private host: ElementRef) { }

  ngAfterViewInit() {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !(Element.prototype as any).animate) { return; }
    // Let the hero finish laying out before measuring it
    this.timer = setTimeout(() => this.run(), 400);
  }

  ngOnDestroy() {
    this.destroyed = true;
    clearTimeout(this.timer);
    if (this.svg) { this.svg.remove(); this.svg = null; }
  }

  private run() {
    const el: HTMLElement = this.host.nativeElement;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w < 400 || h < 150) { return; }

    const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<defs><filter id="hex-trace-glow" x="-5%" y="-50%" width="110%" height="200%">' +
      '<feGaussianBlur stdDeviation="3"/></filter></defs>';
    el.appendChild(svg);
    this.svg = svg;

    // One light per horizontal band of the hero, so they spread out instead
    // of bunching; staggered starts so they read as separate pulses.
    const count = Math.max(3, Math.min(7, Math.round(w / 220)));
    const order = this.shuffle(Array.from({ length: count }, (_, i) => i));
    let lastDelay = 0;
    order.forEach((band, i) => {
      const y = h * (0.12 + 0.76 * (band + 0.2 + Math.random() * 0.6) / count);
      const delay = i * 280 + Math.random() * 200;
      lastDelay = Math.max(lastDelay, delay);
      this.trace(svg, w, h, y, delay, () => { });
    });

    // Then random single pulses, starting once the burst has mostly passed
    this.timer = setTimeout(() => this.ambient(), lastDelay + 2500);
  }

  // One pulse at a random height, then schedule the next. Skipped (but still
  // rescheduled) while the tab is hidden or the hero is scrolled out of view.
  private ambient() {
    if (this.destroyed || !this.svg) { return; }
    const el: HTMLElement = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const visible = !document.hidden && rect.bottom > 0 && rect.top < window.innerHeight;
    const w = el.clientWidth;
    const h = el.clientHeight;

    if (visible && w >= 400 && h >= 150) {
      // Keep the viewBox in step with the hero if the window was resized
      this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      this.trace(this.svg, w, h, h * (0.12 + 0.76 * Math.random()), 0, () => { });
      // Now and then a second one close behind, so the rhythm isn't metronomic
      if (Math.random() < 0.25) {
        this.trace(this.svg, w, h, h * (0.12 + 0.76 * Math.random()), 400 + Math.random() * 600, () => { });
      }
    }

    const gap = this.AMBIENT_MIN + Math.random() * (this.AMBIENT_MAX - this.AMBIENT_MIN);
    this.timer = setTimeout(() => this.ambient(), gap);
  }

  private trace(svg: SVGSVGElement, w: number, h: number, startY: number, delay: number, done: () => void) {
    const points = this.walk(w, h, startY);
    const d = 'M' + points.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L');
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('opacity', '0');
    svg.appendChild(group);

    // Tail layers (long and faint to short and bright), then the glowing head
    const layers = [
      { dash: 180, width: 1, opacity: 0.12 },
      { dash: 90, width: 1.25, opacity: 0.22 },
      { dash: 32, width: 1.5, opacity: 0.45 },
      { dash: 0.01, width: 10, opacity: 0.25, glow: true },
      { dash: 0.01, width: 3.5, opacity: 0.75 }
    ];
    const paths = layers.map(l => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke-width', String(l.width));
      p.setAttribute('opacity', String(l.opacity));
      if (l.glow) { p.setAttribute('filter', 'url(#hex-trace-glow)'); }
      group.appendChild(p);
      return p;
    });

    const len = (paths[0] as SVGPathElement).getTotalLength();
    // Steady pace (~350px/s) so the motion reads as smooth
    const duration = Math.min(4500, Math.max(2500, len / 0.35)) * (0.85 + Math.random() * 0.3);
    const timing = { duration, delay, fill: 'both' };

    paths.forEach((p, i) => {
      const dash = layers[i].dash;
      p.setAttribute('stroke-dasharray', `${dash} ${len + 400}`);
      // Head position s runs 0 -> len; the visible dash covers [s - dash, s]
      (p as any).animate(
        [{ strokeDashoffset: dash }, { strokeDashoffset: dash - len }],
        Object.assign({ easing: 'cubic-bezier(0.25, 0, 0.5, 1)' }, timing)
      );
    });

    // Soft from the start, dimming quickly, gone well before the end of the path
    const fade = (group as any).animate(
      [{ opacity: 0 }, { opacity: 0.6, offset: 0.06 }, { opacity: 0.3, offset: 0.4 }, { opacity: 0.08, offset: 0.7 }, { opacity: 0 }],
      Object.assign({ easing: 'linear' }, timing)
    );
    // Remove the finished pulse so the SVG doesn't fill up over time
    fade.onfinish = () => { group.remove(); done(); };
  }

  private shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Random walk from the right edge toward the left over the lattice edges.
  // Every vertex has one left diagonal, one right diagonal and one vertical
  // edge; the walk never takes the right diagonal, and never two verticals in
  // a row, so it always makes progress leftward.
  private walk(w: number, h: number, targetY: number): Array<[number, number]> {
    const yOf = (v: Vertex) => v.j * TILE_H + LEVEL_Y[v.lvl];
    const stopX = w * 0.45;   // fades out before the lattice is masked away
    const margin = 30;

    // Start on a side vertex (level 1, even cx) just past the right edge
    let cx = Math.ceil(w / HALF) + 1;
    if (cx % 2) { cx++; }
    let v: Vertex = { cx, j: Math.floor(targetY / TILE_H), lvl: 1 };

    const pts: Array<[number, number]> = [[v.cx * HALF, yOf(v)]];
    let lastVertical = false;

    while (v.cx * HALF > stopX && pts.length < 400) {
      const left = this.leftDiagonal(v);
      const vert = this.vertical(v);
      const vy = yOf(vert);
      const canVertical = !lastVertical && vy > margin && vy < h - margin;
      const goVertical = canVertical && Math.random() < 0.45;
      v = goVertical ? vert : left;
      lastVertical = goVertical;
      pts.push([v.cx * HALF, yOf(v)]);
    }
    return pts;
  }

  private leftDiagonal(v: Vertex): Vertex {
    switch (v.lvl) {
      case 0: return { cx: v.cx - 1, j: v.j, lvl: 1 };
      case 1: return { cx: v.cx - 1, j: v.j, lvl: 0 };
      case 2: return { cx: v.cx - 1, j: v.j, lvl: 3 };
      default: return { cx: v.cx - 1, j: v.j, lvl: 2 };
    }
  }

  private vertical(v: Vertex): Vertex {
    switch (v.lvl) {
      case 0: return { cx: v.cx, j: v.j - 1, lvl: 3 };
      case 1: return { cx: v.cx, j: v.j, lvl: 2 };
      case 2: return { cx: v.cx, j: v.j, lvl: 1 };
      default: return { cx: v.cx, j: v.j + 1, lvl: 0 };
    }
  }
}
