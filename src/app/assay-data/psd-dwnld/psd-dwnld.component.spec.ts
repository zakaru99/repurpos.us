import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PsdDwnldComponent } from './psd-dwnld.component';
import { LoginStateService } from '../../_services';

describe('PsdDwnldComponent', () => {
  let component: PsdDwnldComponent;
  let fixture: ComponentFixture<PsdDwnldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ PsdDwnldComponent ],
      providers: [
        DatePipe,
        LoginStateService,
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsdDwnldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
