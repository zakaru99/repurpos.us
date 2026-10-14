import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RouterTestingModule } from '@angular/router/testing';

import { ContactUsComponent } from './contact-us.component';
import { PageHeaderModule } from '../_components/page-header/page-header.module';

@Component({ selector: 're-captcha', template: '' })
class ReCaptchaStubComponent {
  @Input() siteKey: string;
  @Output() resolved = new EventEmitter<string>();
}

describe('ContactUsComponent', () => {
  let component: ContactUsComponent;
  let fixture: ComponentFixture<ContactUsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule, RouterTestingModule, PageHeaderModule ],
      declarations: [ ContactUsComponent, ReCaptchaStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
