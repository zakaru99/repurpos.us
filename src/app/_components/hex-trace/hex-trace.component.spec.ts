import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HexTraceComponent } from './hex-trace.component';

describe('HexTraceComponent', () => {
  let component: HexTraceComponent;
  let fixture: ComponentFixture<HexTraceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HexTraceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HexTraceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('walks leftward along lattice edges only', () => {
    const pts: Array<[number, number]> = (component as any).walk(1200, 500, 250);
    expect(pts.length).toBeGreaterThan(10);
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0];
      const dy = Math.abs(pts[i][1] - pts[i - 1][1]);
      // Either a left diagonal (half a tile across, 9 down/up) or a vertical edge (18)
      const diagonal = Math.abs(dx + 15.59) < 0.01 && Math.abs(dy - 9) < 0.01;
      const vertical = Math.abs(dx) < 0.01 && Math.abs(dy - 18) < 0.01;
      expect(diagonal || vertical).toBe(true);
    }
    expect(pts[pts.length - 1][0]).toBeLessThan(1200 * 0.45 + 0.01);
  });
});
