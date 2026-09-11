import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ShowMoreButtonComponent } from './show-more-button.component';

@Component({ selector: 'app-show-more-pane', template: '' })
class ShowMorePaneStubComponent {
  @Input() qid: string;
  @Input() pid: string;
  @Input() mainQID: string;
}

describe('ShowMoreButtonComponent', () => {
  let component: ShowMoreButtonComponent;
  let fixture: ComponentFixture<ShowMoreButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatButtonModule, MatIconModule, MatTooltipModule, NoopAnimationsModule ],
      declarations: [ ShowMoreButtonComponent, ShowMorePaneStubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMoreButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
