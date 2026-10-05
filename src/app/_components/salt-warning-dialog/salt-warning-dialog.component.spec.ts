import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material';

import { SaltWarningDialogComponent } from './salt-warning-dialog.component';

describe('SaltWarningDialogComponent', () => {
  let component: SaltWarningDialogComponent;
  let fixture: ComponentFixture<SaltWarningDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaltWarningDialogComponent ],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaltWarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
