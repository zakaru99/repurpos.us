import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatRadioModule, MatSliderModule, MatIconModule, MatButtonModule, MatTooltipModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { StructureSearchOptionsComponent } from './structure-search-options.component';
import { StructureService, SearchResultService } from '../../../../_services/index';

describe('StructureSearchOptionsComponent', () => {
  let component: StructureSearchOptionsComponent;
  let fixture: ComponentFixture<StructureSearchOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatRadioModule,
        MatSliderModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        NoopAnimationsModule
      ],
      declarations: [ StructureSearchOptionsComponent ],
      providers: [
        SearchResultService,
        StructureService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // Override queryParams on the real (RouterTestingModule-provided) ActivatedRoute rather than
    // replacing it outright -- a bare replacement lacks `snapshot`, which routerLink's internal
    // createUrlTree() needs, and throws a TypeError reading `_lastPathIndex`.
    const route: ActivatedRoute = TestBed.get(ActivatedRoute);
    (route as any).queryParams = new BehaviorSubject({ type: 'compound' });

    fixture = TestBed.createComponent(StructureSearchOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
