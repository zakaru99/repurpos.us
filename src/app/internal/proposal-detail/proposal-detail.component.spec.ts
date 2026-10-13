import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { ProposalDetailComponent } from './proposal-detail.component';

describe('ProposalDetailComponent', () => {
  let component: ProposalDetailComponent;
  let fixture: ComponentFixture<ProposalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule ],
      declarations: [ ProposalDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalDetailComponent);
    component = fixture.componentInstance;
    component.proposal = { id: 7, indication: 'Malaria', submittedBy: 'A', status: 'Pending',
                           description: '', notes: '', denialReason: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not reject without a reason', () => {
    component.startReject();
    component.denialReason = '   ';
    component.confirm();
    expect(component.saving).toBe(false);
  });
});
