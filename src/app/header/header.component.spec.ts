import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { LoginStateService } from '../_services/index';

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent {}

@Component({ selector: 'app-quick-search', template: '' })
class QuickSearchStubComponent {}

@Component({ selector: 'app-user-login', template: '' })
class UserLoginStubComponent {}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [
        HeaderComponent,
        MatIconStubComponent,
        QuickSearchStubComponent,
        UserLoginStubComponent
      ],
      providers: [ LoginStateService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
