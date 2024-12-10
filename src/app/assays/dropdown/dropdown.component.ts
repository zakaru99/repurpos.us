import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Input() types: string[] = [];  // Input for types
  @Output() typeSelected = new EventEmitter<string>();  // Output for selected type


  @Input() yDomain: string[];
  // = ["cell-based", "cell viability", "high-content imaging", "biochemical", "enzymatic", "cytotox", "phenotypic"];
  value_counts: Object[];
  selected: string[];


  constructor() { }

  ngOnInit() {

  }


  

  onTypeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.typeSelected.emit(selectedValue);  // Emit the selected value
    console.log(selectedValue)



  }
}
