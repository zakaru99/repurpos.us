import { Component, OnInit, Input, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-text-search',
  templateUrl: './text-search.component.html',
  styleUrls: ['./text-search.component.scss']
})
export class TextSearchComponent implements OnInit {
  @Input() searchQuery: string;
  @ViewChild('searchInput') searchInputRef: ElementRef;

  suggestions: any[] = [];
  dropdownVisible: boolean = false;
  highlightedIndex: number = -1;
  dropdownStyle: { top: string, left: string, width: string } = { top: '0', left: '0', width: '0' };
  private queryChanged = new Subject<string>();

  examples: Array<any> = [
    { 'type': 'string', 'query': 'imatinib mesylate', 'label': 'drug search', 'description': 'imatinib mesylate' },
    { 'type': 'string', 'query': 'WXJFKKQWPMNTIM', 'label': 'InChI key search', 'description': 'WXJFKKQWPMNTIM (brincidofovir)' },
    { 'type': 'string', 'query': 'tyrosine kinase inhibitor', 'label': 'class search', 'description': 'tyrosine kinase inhibitor' },
    { 'type': 'string', 'query': 'glioblastoma', 'label': 'disease search', 'description': 'glioblastoma' }
  ]

  constructor(private router: Router, private http: HttpClient, private eRef: ElementRef) { }

  ngOnInit() {
    this.queryChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((q: string) => {
        if (q.length > 1) {
          this.fetchSuggestions(q);
        } else {
          this.suggestions = [];
          this.dropdownVisible = false;
        }
      });
  }

  onQueryChange(value: string) {
    this.queryChanged.next(value);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveHighlight(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveHighlight(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.dropdownVisible && this.highlightedIndex > -1) {
        this.selectSuggestion(this.suggestions[this.highlightedIndex]['value']);
      } else {
        this.onSubmit();
      }
    }
  }

  private updateDropdownPosition() {
    if (!this.searchInputRef) return;
    const rect = this.searchInputRef.nativeElement.getBoundingClientRect();
    this.dropdownStyle = {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    };
  }

  fetchSuggestions(q: string) {
    const url = `/api/suggest?q=${encodeURIComponent(q)}&type=compound`;
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        this.suggestions = results;
        if (results.length > 0) {
          this.updateDropdownPosition();
          this.dropdownVisible = true;
        } else {
          this.dropdownVisible = false;
        }
      },
      error: () => {
        this.suggestions = [];
        this.dropdownVisible = false;
      }
    });
  }

  moveHighlight(direction: number) {
    if (!this.dropdownVisible) return;
    const count = this.suggestions.length;
    this.highlightedIndex = (this.highlightedIndex + direction + count) % count;
    this.searchQuery = this.suggestions[this.highlightedIndex]['value'];
  }

  setHighlight(index: number) {
    this.highlightedIndex = index;
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.dropdownVisible = false;
    this.onSubmit();
  }

  onSubmit() {
    this.router.navigate(['search'], {
      queryParams: { query: this.searchQuery, type: 'string' }
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownVisible = false;
    }
  }
}
