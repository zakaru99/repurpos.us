import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { KetcherComponent } from './ketcher.component';
import { SearchResultService, StructureService } from '../../../../_services/index';

describe('KetcherComponent', () => {
  let component: KetcherComponent;
  let fixture: ComponentFixture<KetcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ KetcherComponent ],
      providers: [
        SearchResultService,
        StructureService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KetcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
