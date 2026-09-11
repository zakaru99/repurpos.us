import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { SaltWarningComponent } from './salt-warning.component';

describe('SaltWarningComponent', () => {
  let component: SaltWarningComponent;
  let fixture: ComponentFixture<SaltWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaltWarningComponent ],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaltWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
