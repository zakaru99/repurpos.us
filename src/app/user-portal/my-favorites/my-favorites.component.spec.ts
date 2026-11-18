import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { PageHeaderModule } from '../../_components/page-header/page-header.module';
import { FavoritesService } from '../../_services/favorites.service';
import { MyFavoritesComponent } from './my-favorites.component';

// A failed load must not read as "Nothing saved yet"
describe('MyFavoritesComponent', () => {
  let fixture: ComponentFixture<MyFavoritesComponent>;
  const favorites$ = new BehaviorSubject<any[]>([]);
  const loadState$ = new BehaviorSubject<string>('loading');
  const service = { favorites$, loadState$, load: jasmine.createSpy('load'), remove: () => {} };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, PageHeaderModule],
      declarations: [MyFavoritesComponent],
      providers: [{ provide: FavoritesService, useValue: service }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyFavoritesComponent);
    fixture.detectChanges();
  });

  const text = () => fixture.nativeElement.textContent;

  it('says loading, not empty, while favorites load', () => {
    loadState$.next('loading');
    fixture.detectChanges();
    expect(text()).toContain('Loading');
    expect(text()).not.toContain('Nothing saved yet');
  });

  it('says the favorites failed to load, with a retry, instead of showing them as empty', () => {
    loadState$.next('failed');
    fixture.detectChanges();
    expect(text()).toContain("We couldn't load your favorites");
    expect(text()).not.toContain('Nothing saved yet');
    (fixture.nativeElement.querySelector('.status-primary') as HTMLElement).click();
    expect(service.load).toHaveBeenCalled();
  });

  it('shows the empty state only once loaded with nothing saved', () => {
    loadState$.next('ready');
    fixture.detectChanges();
    expect(text()).toContain('Nothing saved yet');
  });
});
