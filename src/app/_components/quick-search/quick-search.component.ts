import { Component, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent implements OnInit, AfterViewInit {
  query: string;
  inputFocused: boolean = false;
  buttonFocusedOrClicked: boolean = false;
  selected: 'compound' | 'assay' = 'compound';

  

  constructor(private router: Router) { }
  @Output() toggleChange = new EventEmitter<'compound' | 'assay'>();

  @ViewChild('inputEl') searchInput!: ElementRef;

  ngAfterViewInit(){
    this.searchInput.nativeElement.focus()
  }
  ngOnInit() {
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
}
