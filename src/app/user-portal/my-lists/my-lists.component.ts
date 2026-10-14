import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompoundListsService, CompoundList, CompoundListItem } from '../../_services/compound-lists.service';

// Lists on the left, the selected list's compounds on the right. The first
// list opens by default; deleting a list asks in place first.
@Component({
  selector: 'app-my-lists',
  templateUrl: './my-lists.component.html',
  styleUrls: ['./my-lists.component.scss']
})
export class MyListsComponent implements OnInit, OnDestroy {
  lists: CompoundList[] = [];
  selectedId: number | null = null;
  items: CompoundListItem[] = [];
  loadingItems = false;
  confirmDelete = false;
  newListName = '';
  showNewInput = false;
  @ViewChild('newInput') newInput: ElementRef;

  private sub: Subscription;
  private itemsSub: Subscription;

  constructor(private listsService: CompoundListsService) {}

  ngOnInit(): void {
    this.sub = this.listsService.lists$.subscribe(lists => {
      this.lists = lists;
      const stillThere = lists.find(l => l.id === this.selectedId);
      if (!stillThere) {
        this.selectedId = null;
        this.items = [];
        if (lists.length) { this.select(lists[0].id); }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
    if (this.itemsSub) { this.itemsSub.unsubscribe(); }
  }

  get selected(): CompoundList | undefined {
    return this.lists.find(l => l.id === this.selectedId);
  }

  select(listId: number): void {
    if (listId === this.selectedId) { return; }
    this.selectedId = listId;
    this.confirmDelete = false;
    this.loadingItems = true;
    this.items = [];
    if (this.itemsSub) { this.itemsSub.unsubscribe(); }
    this.itemsSub = this.listsService.getItems(listId).subscribe({
      next: items => { this.items = items; this.loadingItems = false; },
      error: () => { this.loadingItems = false; }
    });
  }

  openNew(): void {
    this.showNewInput = true;
    setTimeout(() => this.newInput && this.newInput.nativeElement.focus());
  }

  cancelNew(): void {
    this.showNewInput = false;
    this.newListName = '';
  }

  createList(): void {
    const name = this.newListName.trim();
    if (!name) { return; }
    this.cancelNew();
    this.listsService.createList(name).subscribe();
  }

  deleteList(listId: number): void {
    this.confirmDelete = false;
    this.listsService.deleteList(listId);
  }

  removeItem(compoundId: string): void {
    if (this.selectedId === null) { return; }
    this.listsService.removeFromList(this.selectedId, compoundId);
    this.items = this.items.filter(i => i.compound_id !== compoundId);
    // Keep the count on the left in step without reloading every list
    const list = this.selected;
    if (list) { list.item_count = this.items.length; }
  }
}
