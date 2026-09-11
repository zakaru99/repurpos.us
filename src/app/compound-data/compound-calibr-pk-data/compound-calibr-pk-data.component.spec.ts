import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CompoundCalibrPkDataComponent } from './compound-calibr-pk-data.component';
import { CompoundService, LoginStateService, BackendSearchService } from '../../_services';

describe('CompoundCalibrPkDataComponent', () => {
  let component: CompoundCalibrPkDataComponent;
  let fixture: ComponentFixture<CompoundCalibrPkDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ CompoundCalibrPkDataComponent ],
      providers: [CompoundService, LoginStateService, BackendSearchService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompoundCalibrPkDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
