import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TextSearchComponent } from './text-search.component';

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent {}

describe('TextSearchComponent', () => {
  let component: TextSearchComponent;
  let fixture: ComponentFixture<TextSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule, RouterTestingModule ],
      declarations: [ TextSearchComponent, MatIconStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
