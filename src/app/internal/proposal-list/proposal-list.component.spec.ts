import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProposalListComponent } from './proposal-list.component';

@Component({ selector: 'app-proposal-table', template: '' })
class ProposalTableStubComponent {
  @Input() proposals: any;
  @Input() selectedId: any;
  @Input() compact: any;
  @Input() maxHeight: any;
  @Output() pick = new EventEmitter<any>();
}

@Component({ selector: 'app-proposal-detail', template: '' })
class ProposalDetailStubComponent {
  @Input() proposal: any;
  @Output() statusChanged = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();
}

describe('ProposalListComponent', () => {
  let component: ProposalListComponent;
  let fixture: ComponentFixture<ProposalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ProposalListComponent, ProposalDetailStubComponent, ProposalTableStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter by status and search text', () => {
    component.proposals = [
      { id: 1, indication: 'Malaria', submittedBy: 'A', status: 'Pending', description: '', notes: '', denialReason: '' },
      { id: 2, indication: 'Tuberculosis', submittedBy: 'B', status: 'Approved', description: '', notes: '', denialReason: '' }
    ];
    component.selectedStatus = 'Pending';
    expect(component.filteredProposals.map(p => p.id)).toEqual([1]);
    component.selectedStatus = '';
    component.query = 'tuber';
    expect(component.filteredProposals.map(p => p.id)).toEqual([2]);
  });
});
