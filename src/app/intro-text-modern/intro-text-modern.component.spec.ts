import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { IntroTextModernComponent } from './intro-text-modern.component';

@Component({ selector: 'app-hero-search', template: '' })
class HeroSearchStubComponent {}

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
        ExploreTabsStubComponent
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
});
