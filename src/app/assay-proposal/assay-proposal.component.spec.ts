import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PageHeaderModule } from '../_components/page-header/page-header.module';

import { AssayProposalComponent } from './assay-proposal.component';
import { LoginStateService } from '../_services';

describe('AssayProposalComponent', () => {
  let component: AssayProposalComponent;
  let fixture: ComponentFixture<AssayProposalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule, RouterTestingModule, PageHeaderModule],
      declarations: [ AssayProposalComponent ],
      providers: [LoginStateService]
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
