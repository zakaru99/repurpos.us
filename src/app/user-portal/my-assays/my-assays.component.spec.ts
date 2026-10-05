import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MyAssaysComponent } from './my-assays.component';
import { LoginStateService } from '../../_services';

describe('MyAssaysComponent', () => {
  let component: MyAssaysComponent;
  let fixture: ComponentFixture<MyAssaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ MyAssaysComponent ],
      providers: [ LoginStateService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAssaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
