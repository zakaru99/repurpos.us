import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule, MatExpansionModule } from '@angular/material';

import { SearchResultSimilarComponent } from './search-result-similar.component';

describe('SearchResultSimilarComponent', () => {
  let component: SearchResultSimilarComponent;
  let fixture: ComponentFixture<SearchResultSimilarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, NoopAnimationsModule, MatTooltipModule, MatExpansionModule ],
      declarations: [ SearchResultSimilarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultSimilarComponent);
    component = fixture.componentInstance;
    // template reads compound_result['similar_compounds'] unguarded, so a value must be
    // set before the first change detection or it throws on an undefined input.
    component.compound_result = <any>{ similar_compounds: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
