import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent implements OnInit {
  query = '';
  inputFocused = false;
  selected: 'compound' | 'assay' = 'compound';

  // From /api/suggest: [{ value, type }]
  suggestions: Array<{ value: string; type?: string }> = [];
  highlightedIndex = -1;
  private queryChanged = new Subject<string>();

  @Output() toggleChange = new EventEmitter<'compound' | 'assay'>();
  @ViewChild('inputEl') searchInput: ElementRef;

  constructor(private router: Router, private http2: HttpClient) { }

  ngOnInit(): void {
    this.queryChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((q: string) => this.fetchSuggestions(q));
  }

  select(option: 'compound' | 'assay') {
    if (this.selected !== option) {
      this.selected = option;
      this.toggleChange.emit(option);
      // Suggestions belong to the scope; refetch for the new one
      this.suggestions = [];
      this.highlightedIndex = -1;
      this.fetchSuggestions(this.query);
    }
    this.focusInput(this.searchInput.nativeElement);
  }

  getPlaceholder(): string {
    return this.selected === 'compound' ? 'Drug name, synonym or identifier' : 'Assay name, organism or keyword';
  }

  onFocusIn() {
    this.inputFocused = true;
  }

  // Only close when focus leaves the whole form (the scope tabs are inside it)
  onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) {
      this.close();
    }
  }

  focusInput(input: HTMLInputElement) {
    input.focus();
  }

  onQueryChange(q: string) {
    this.highlightedIndex = -1;
    this.queryChanged.next(q || '');
  }

  // Arrow keys move through suggestions, Enter searches (or opens the
  // highlighted suggestion), Escape closes
  onKeyDown(event: KeyboardEvent) {
    const count = this.suggestions.length;
    if (event.key === 'ArrowDown' && count) {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex + 1) % count;
    } else if (event.key === 'ArrowUp' && count) {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex - 1 + count) % count;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.highlightedIndex > -1 && this.suggestions[this.highlightedIndex]) {
        this.onSuggestionClick(this.suggestions[this.highlightedIndex].value);
      } else {
        this.onEnter();
      }
    } else if (event.key === 'Escape') {
      this.searchInput.nativeElement.blur();
      this.close();
    }
  }

  onEnter() {
    const q = (this.query || '').trim();
    if (!q) { return; }
    if (this.selected === 'compound') {
      this.router.navigate(['search/'], { queryParams: { query: q, type: 'string', fuzziness: 'AUTO' } });
    } else {
      this.router.navigate(['assays/'], { queryParams: { query: q } });
    }
    this.query = '';
    this.searchInput.nativeElement.blur();
    this.close();
  }

  onSuggestionClick(suggestion: string) {
    this.query = suggestion;
    this.onEnter();
  }

  private fetchSuggestions(q: string) {
    if (!q || q.trim().length < 2) {
      this.suggestions = [];
      return;
    }
    const type = this.selected;
    this.http2.get<Array<{ value: string; type?: string }>>(
      `/api/suggest?q=${encodeURIComponent(q.trim())}&type=${type}`
    ).subscribe({
      next: results => {
        // Ignore a late answer for a scope the user has since switched away from
        if (type === this.selected) { this.suggestions = results || []; }
      },
      error: () => this.suggestions = []
    });
  }

  private close() {
    this.inputFocused = false;
    this.suggestions = [];
    this.highlightedIndex = -1;
  }
}
