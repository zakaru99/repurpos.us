import { Component, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Component({
  selector: 'app-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent implements OnInit {
  query: string;
  inputFocused: boolean = false;
  buttonFocusedOrClicked: boolean = false;
  selected: 'compound' | 'assay' = 'compound';

  suggestions: string[] = [];
  private queryChanged = new Subject<string>();

  

  constructor(private router: Router, private http2: HttpClient) { }
  @Output() toggleChange = new EventEmitter<'compound' | 'assay'>();

  @ViewChild('inputEl') searchInput!: ElementRef;

  ngOnInit(): void {
    console.log("QuickSearchComponent initialized");


    this.queryChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((q: string) => {
        if (q.length > 1) {
          this.fetchSuggestions(q);
        } else {
          this.suggestions = [];
        }
      });
  }

  select(option: 'compound' | 'assay') {
    if (this.selected !== option) {
      this.selected = option;
      this.toggleChange.emit(option);
    }
  }

  getPlaceholder(): string{
    return this.selected === 'compound'
    ? 'Search for drugs, classes...'
    : 'Search for title, summary...';
  }

  onFocusIn() {
    this.inputFocused = true;
  }
  
  onFocusOut(event: FocusEvent) {
    const newTarget = event.relatedTarget as HTMLElement | null;
  
    // Only collapse if focus moved completely outside the form
    if (!newTarget || !event.currentTarget || !(event.currentTarget as HTMLElement).contains(newTarget)) {
      this.inputFocused = false;
    }
  }
  

  focusInput(input: HTMLInputElement) {
    input.focus();
  }

  onInputFocus() {
    this.inputFocused = true;
  }

  onEnter() {
    if(this.selected === 'compound'){
      let curr_query = this.query;
      // reset query
      this.query = '';
      this.router.navigate(['search/'], {
        queryParams:
          {
            query: curr_query,
            type: 'string',
            "fuzziness":"AUTO"
          }
      });
    }else{
      let curr_query = this.query;
    this.query = '';
    console.log(curr_query)
    this.router.navigate(['assays/'], {
      queryParams:
        {
          query: curr_query
        }
    });
    }
    
  }

    fetchSuggestions(q: string) {
    console.log(this.selected)
    if (!q || q.length < 2) {
      this.suggestions = [];
      return;
    }

    let curr_query = q;
    const type =  this.selected;
    const url = `/api/suggest?q=${encodeURIComponent(curr_query)}&type=${type}`;

    this.http2.get<string[]>(url).subscribe({
      next: (results: string[]) => {
        this.suggestions = results;
        console.log(`${type} suggestions for`, curr_query, ':', this.suggestions);
      },
      error: (err) => {
        console.error(`Error fetching ${type} suggestions:`, err);
        this.suggestions = [];
      }
    });
    console.log(this.suggestions)
  }

  onKeyUp(event: KeyboardEvent){
    console.log(this.query)
    this.queryChanged.next(this.query);
  }

  onSuggestionClick(suggestion: string) {
  this.query = suggestion;
  this.suggestions = [];
  this.onEnter(); // optional: auto-submit search on click
}
}
