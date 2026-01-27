import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssayProposalComponent } from './assay-proposal.component';

describe('AssayProposalComponent', () => {
  let component: AssayProposalComponent;
  let fixture: ComponentFixture<AssayProposalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssayProposalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssayProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
