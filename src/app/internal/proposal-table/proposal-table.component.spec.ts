import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalTableComponent } from './proposal-table.component';

describe('ProposalTableComponent', () => {
  let component: ProposalTableComponent;
  let fixture: ComponentFixture<ProposalTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
