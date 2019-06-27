
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency'
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number, _?: any): any {
    if (value == null) {
      return '';
    }
    if (isNaN(value)) {
      return 'Not a number';
    }

    const number = Number(value);
    return `R ${number.toFixed(2)}`;
  }

}
