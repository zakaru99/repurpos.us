import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPortalLayoutComponent } from './user-portal-layout.component';

describe('UserPortalLayoutComponent', () => {
  let component: UserPortalLayoutComponent;
  let fixture: ComponentFixture<UserPortalLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPortalLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPortalLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
