import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MenubarItemComponent } from './menubar-item.component';

describe('MenubarItemComponent', () => {
  let component: MenubarItemComponent;
  let fixture: ComponentFixture<MenubarItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ MenubarItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenubarItemComponent);
    component = fixture.componentInstance;
    component.item = { label: 'Test', name: 'test', path: 'test', component: null };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
