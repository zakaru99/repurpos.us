import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { LoaderComponent } from './loader.component';
import { LoaderStateService } from '../../_services/index';

@Component({ selector: 'mat-progress-spinner', template: '' })
class MatProgressSpinnerStubComponent {}

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoaderComponent, MatProgressSpinnerStubComponent ],
      providers: [
        LoaderStateService,
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
