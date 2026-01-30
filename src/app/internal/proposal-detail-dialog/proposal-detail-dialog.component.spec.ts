import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalDetailDialogComponent } from './proposal-detail-dialog.component';

describe('ProposalDetailDialogComponent', () => {
  let component: ProposalDetailDialogComponent;
  let fixture: ComponentFixture<ProposalDetailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalDetailDialogComponent ]
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
