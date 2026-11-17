import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { LoginStateService } from '../../_services';
import { ProposalDetailComponent } from './proposal-detail.component';

describe('ProposalDetailComponent', () => {
  let component: ProposalDetailComponent;
  let fixture: ComponentFixture<ProposalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule ],
      declarations: [ ProposalDetailComponent ],
      providers: [ LoginStateService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalDetailComponent);
    component = fixture.componentInstance;
    TestBed.get(LoginStateService).loggedIn('reviewer', 'rev@scripps.edu');
    component.proposal = { id: 7, indication: 'Malaria', submittedBy: 'A', status: 'Pending',
                           description: '', notes: '', denialReason: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide Approve and Reject from read-only staff', () => {
    TestBed.get(LoginStateService).loggedIn('readonly', 'ro@scripps.edu');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.decide')).toBeNull();
    expect(fixture.nativeElement.querySelector('.meta .status').textContent).toContain('Pending');
  });

  it('should arm Approve on the first click without saving', () => {
    component.onApprove();
    expect(component.mode).toBe('confirm-approve');
    expect(component.saving).toBe(false);
  });

  it('should not reject without a reason', () => {
    component.startReject();
    component.denialReason = '   ';
    component.confirm();
    expect(component.saving).toBe(false);
  });
});
