import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { QuickSearchComponent } from './quick-search.component';

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent {}

describe('QuickSearchComponent', () => {
  let component: QuickSearchComponent;
  let fixture: ComponentFixture<QuickSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule, RouterTestingModule ],
      declarations: [ QuickSearchComponent, MatIconStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
