import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SaltFormComponent } from './salt-form.component';

describe('SaltFormComponent', () => {
  let component: SaltFormComponent;
  let fixture: ComponentFixture<SaltFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatChipsModule, NoopAnimationsModule ],
      declarations: [ SaltFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaltFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
