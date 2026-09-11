import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegButtonComponent } from './user-reg-button.component';

describe('UserRegButtonComponent', () => {
  let component: UserRegButtonComponent;
  let fixture: ComponentFixture<UserRegButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRegButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRegButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
