import { Component, OnInit } from '@angular/core';
import { FavoritesService, FavoriteItem } from '../../_services/favorites.service';

@Component({
  selector: 'app-my-favorites',
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.scss']
})
export class MyFavoritesComponent implements OnInit {
  favorites: FavoriteItem[] = [];

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.favoritesService.favorites$.subscribe(favs => {
      this.favorites = favs;
    });
  }

  remove(compoundId: string): void {
    this.favoritesService.remove(compoundId);
  }
}
