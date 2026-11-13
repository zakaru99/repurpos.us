import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [NotFoundComponent]
    }).compileComponents();
  }));

  it('says the page is missing and links home and to search', () => {
    const fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain("We can't find that page");
    const links = Array.from(el.querySelectorAll('a')).map(a => a.getAttribute('href'));
    expect(links).toContain('/');
    expect(links).toContain('/search');
  });
});
