import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { IntroTextModernComponent } from './intro-text-modern.component';

@Component({ selector: 'app-hero-search', template: '' })
class HeroSearchStubComponent {}

describe('IntroTextModernComponent', () => {
  let component: IntroTextModernComponent;
  let fixture: ComponentFixture<IntroTextModernComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ IntroTextModernComponent, HeroSearchStubComponent ]
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
});
