import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { IntroTextModernComponent } from './intro-text-modern.component';

@Component({ selector: 'app-hero-search', template: '' })
class HeroSearchStubComponent {}

@Component({ selector: 'app-hex-trace', template: '' })
class HexTraceStubComponent {}

@Component({ selector: 'app-explore-tabs', template: '' })
class ExploreTabsStubComponent {
  @Input() moaCategories: any;
  @Input() ontologies: any;
}

describe('IntroTextModernComponent', () => {
  let component: IntroTextModernComponent;
  let fixture: ComponentFixture<IntroTextModernComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [
        IntroTextModernComponent,
        HeroSearchStubComponent,
        ExploreTabsStubComponent,
        HexTraceStubComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroTextModernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load figures and release notes from home-data.ts', () => {
    expect(component.stats.totalCompounds).toBeGreaterThan(0);
    expect(component.whatsNewItems.length).toBeGreaterThan(0);
  });

  it('should draw the phase chart from /api/library_stats', () => {
    TestBed.get(HttpTestingController).expectOne('/api/library_stats').flush({
      total: 30,
      phases: [{ label: 'Launched', value: 20 }, { label: 'Phase III', value: 10 }]
    });
    fixture.detectChanges();
    expect(component.phases.length).toBe(2);
    expect(component.phaseTotal).toBe(30);
    expect(fixture.nativeElement.textContent).toContain('Share of the 30 compounds in the screening library');
  });

  it('should hide the phase chart if the counts fail to load', () => {
    TestBed.get(HttpTestingController).expectOne('/api/library_stats')
      .flush({ error: 'es down' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(component.phasesFailed).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain('Compounds by highest development phase');
  });
});
