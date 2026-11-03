import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { UserManagementComponent } from './user-management.component';
import { LoginStateService } from '../../_services/index';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule ],
      providers: [ LoginStateService ],
      declarations: [ UserManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count each role in the headline', () => {
    const u = (id: number, role: any) => ({ id, email: id + '@scripps.edu', role } as any);
    component.staff = [u(1, 'admin'), u(2, 'admin'), u(3, 'reviewer'), u(4, 'readonly')];
    expect(component.headline).toBe('2 admins, 1 reviewer and 1 read-only');
    component.staff = [u(1, 'admin'), u(4, 'readonly'), u(5, 'readonly')];
    expect(component.headline).toBe('1 admin and 2 read-only');
    component.staff = [u(1, 'admin')];
    expect(component.headline).toBe('1 admin');
  });

  it('should open the role menu and ask before changing a role', () => {
    const ro = { id: 4, email: 'ro@scripps.edu', role: 'readonly' } as any;
    component.toggleMenu(ro, new Event('click'));
    expect(component.isMenuOpen(ro)).toBe(true);
    component.pick(ro, 'admin');
    expect(component.isMenuOpen(ro)).toBe(false);
    expect(component.isConfirming(ro, 'admin')).toBe(true);
    expect(component.confirmLabel(ro)).toBe('Change role');
  });

  it('should only close the menu when their current role is picked', () => {
    const ro = { id: 4, email: 'ro@scripps.edu', role: 'readonly' } as any;
    component.toggleMenu(ro, new Event('click'));
    component.pick(ro, 'readonly');
    expect(component.menuFor).toBeNull();
    expect(component.confirmUser).toBeNull();
  });
});
