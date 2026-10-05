import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { IntroTextComponent } from './intro-text.component';

@Component({ selector: 'app-citation', template: '' })
class CitationStubComponent {
  @Input() pmid: any;
}

@Component({ selector: 'app-compound-search', template: '' })
class CompoundSearchStubComponent {}

describe('IntroTextComponent', () => {
  let component: IntroTextComponent;
  let fixture: ComponentFixture<IntroTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ IntroTextComponent, CitationStubComponent, CompoundSearchStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
