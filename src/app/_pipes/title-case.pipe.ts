import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecase'
})

// Angular 6 has no built-in TitleCasePipe (added in Angular 7) -- this matches its behavior.
export class TitleCasePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return value;
    }
    return value.toLowerCase().replace(/(^|\s)([a-z])/g, (match, boundary, letter) => boundary + letter.toUpperCase());
  }

}
