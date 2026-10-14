import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FavoritesService, FavoriteItem } from '../../_services/favorites.service';

// Saved compounds as a table, newest first, with a filter once the list is long.
@Component({
  selector: 'app-my-favorites',
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.scss']
})
export class MyFavoritesComponent implements OnInit, OnDestroy {
  favorites: FavoriteItem[] = [];
  query = '';
  private sub: Subscription;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.sub = this.favoritesService.favorites$.subscribe(favs => {
      this.favorites = [...favs].sort((a, b) => +new Date(b.saved_on) - +new Date(a.saved_on));
    });
  }

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
  }

  get shown(): FavoriteItem[] {
    const q = this.query.trim().toLowerCase();
    if (!q) { return this.favorites; }
    return this.favorites.filter(f =>
      (f.label || '').toLowerCase().includes(q) || f.compound_id.toLowerCase().includes(q));
  }

  remove(compoundId: string): void {
    this.favoritesService.remove(compoundId);
  }
}
