import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ProposalDetailDialogComponent } from './proposal-detail-dialog.component';

describe('ProposalDetailDialogComponent', () => {
  let component: ProposalDetailDialogComponent;
  let fixture: ComponentFixture<ProposalDetailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule ],
      declarations: [ ProposalDetailDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            id: 1,
            status: 'Pending',
            submittedBy: 'Test User',
            email: 'test@example.com',
            institution: 'Test Institution',
            submittedOn: new Date(),
            indication: '',
            volume: null,
            concentration: null,
            description: '',
            notes: '',
            denialReason: ''
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
