import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAssaysComponent } from './my-assays.component';

describe('MyAssaysComponent', () => {
  let component: MyAssaysComponent;
  let fixture: ComponentFixture<MyAssaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAssaysComponent ]
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
