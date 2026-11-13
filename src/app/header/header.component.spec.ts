import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { LoginStateService } from '../_services/index';

@Component({ selector: 'mat-icon', template: '' })
class MatIconStubComponent {}

@Component({ selector: 'app-quick-search', template: '' })
class QuickSearchStubComponent {}

@Component({ selector: 'app-user-login', template: '' })
class UserLoginStubComponent {
  @Input() open: boolean;
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'search', component: QuickSearchStubComponent }]) ],
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

  it('closes the phone menu after a search (or any navigation) from it', fakeAsync(() => {
    component.toggleNav();
    expect(component.expanded).toBe(true);
    expect(document.body.classList.contains('menu-open')).toBe(true);

    TestBed.get(Router).navigate(['search'], { queryParams: { query: 'imatinib' } });
    tick();

    expect(component.expanded).toBe(false);
    expect(document.body.classList.contains('menu-open')).toBe(false);
  }));
});
