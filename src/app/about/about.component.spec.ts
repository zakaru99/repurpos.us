import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AboutComponent } from './about.component';

@Component({ selector: 'app-access-library', template: '' })
class AccessLibraryStubComponent {}

@Component({ selector: 'app-sources', template: '' })
class SourcesStubComponent {}

@Component({ selector: 'app-terms', template: '' })
class TermsStubComponent {}

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        AboutComponent,
        AccessLibraryStubComponent,
        SourcesStubComponent,
        TermsStubComponent
      ],
      providers: [
        Title,
        Meta,
        { provide: ActivatedRoute, useValue: { fragment: of(null) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
