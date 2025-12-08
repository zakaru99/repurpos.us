import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.scss']
})
export class HeroSearchComponent implements OnInit {

  searchCategory: string = 'compound';
  query: string;
  suggestions: string[] = [];
  dropdownVisible: boolean = false;
  highlightedIndex: number = -1;
  private queryChanged = new Subject<string>();
  
  constructor(private router: Router, private http2: HttpClient, private eRef: ElementRef) { }

  ngOnInit(): void {
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

  onQueryChange(value: string) {
  this.queryChanged.next(value);
}


 setSearchCategory(category: string){
    this.searchCategory = category;
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
      this.selectSuggestion(this.suggestions[this.highlightedIndex]);
    } else {
      this.search();
    }
  }
}


  search() {
    if(this.searchCategory === 'compound'){
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
    this.router.navigate(['assays/'], {
      queryParams:
        {
          query: curr_query
        }
    });
    }
  }

  fetchSuggestions(q: string) {
    if (!q || q.length < 2) {
      this.suggestions = [];
      return;
    }

    let curr_query = q;
    const type =  this.searchCategory;
    const url = `/api/suggest?q=${encodeURIComponent(curr_query)}&type=${type}`;

    this.http2.get<string[]>(url).subscribe({
      next: (results: string[]) => {
        this.suggestions = results;
        console.log(`${type} suggestions for`, curr_query, ':', this.suggestions);
        this.dropdownVisible = this.suggestions.length > 0;
      },
      error: (err) => {
        console.error(`Error fetching ${type} suggestions:`, err);
        this.suggestions = [];
        this.dropdownVisible = false;
      }
    });
  }

  moveHighlight(direction: number) {
    if (!this.dropdownVisible) return;
    const count = this.suggestions.length;
    this.highlightedIndex = (this.highlightedIndex + direction + count) % count;
    this.query = this.suggestions[this.highlightedIndex];
  }

  setHighlight(index: number) {
    this.highlightedIndex = index;
    this.query = this.suggestions[index]; // keep input in sync
  }


  selectSuggestion(suggestion: string) {
    this.query = suggestion;
    this.dropdownVisible = false;
    this.search();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownVisible = false;
    }
  }




}
