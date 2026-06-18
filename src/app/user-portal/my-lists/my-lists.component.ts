import { Component, OnInit } from '@angular/core';
import { CompoundListsService, CompoundList, CompoundListItem } from '../../_services/compound-lists.service';

@Component({
  selector: 'app-my-lists',
  templateUrl: './my-lists.component.html',
  styleUrls: ['./my-lists.component.scss']
})
export class MyListsComponent implements OnInit {
  lists: CompoundList[] = [];
  expandedListId: number | null = null;
  expandedItems: CompoundListItem[] = [];
  newListName = '';
  showNewInput = false;

  constructor(private listsService: CompoundListsService) {}

  ngOnInit(): void {
    this.listsService.lists$.subscribe(lists => {
      this.lists = lists;
      if (this.expandedListId !== null && !lists.find(l => l.id === this.expandedListId)) {
        this.expandedListId = null;
        this.expandedItems = [];
      }
    });
  }

  toggleExpand(listId: number): void {
    if (this.expandedListId === listId) {
      this.expandedListId = null;
      this.expandedItems = [];
    } else {
      this.expandedListId = listId;
      this.listsService.getItems(listId).subscribe(items => {
        this.expandedItems = items;
      });
    }
  }

  createList(): void {
    const name = this.newListName.trim();
    if (!name) { return; }
    this.newListName = '';
    this.showNewInput = false;
    this.listsService.createList(name).subscribe();
  }

  deleteList(listId: number): void {
    this.listsService.deleteList(listId);
  }

  removeItem(compoundId: string): void {
    if (this.expandedListId === null) { return; }
    this.listsService.removeFromList(this.expandedListId, compoundId);
    this.expandedItems = this.expandedItems.filter(i => i.compound_id !== compoundId);
  }
}
