import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class DatePipe implements PipeTransform {
  static toDateString(value: string): string {
    if (value == null || value.trim() === '') {
      return '';
    }
    const pattern = /(\d{4})(\d{2})(\d{2})/;
    const dateString = value.replace(pattern, '$1-$2-$3');
    return dateString;
  }
  static formatDate(value: string): string {
    const dateString = DatePipe.toDateString(value);
    if (dateString === '') {
      return '';
    }
    return new Date(dateString).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  transform(value: any, _?: any): any {
    return DatePipe.formatDate(value);
  }

}
