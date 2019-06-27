import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDateTime'
})
export class DateTimePipe implements PipeTransform {
  static toDateTimeString(value: string, dateTimeSeparator: string = 'T'): string {
    if (value == null || value.trim() === '') {
      return '';
    }
    const pattern = /(\d{4})(\d{2})(\d{2}) (\d{2})(\d{2})(\d{2})/;
    const dateString = value.replace(pattern, `$1-$2-$3${dateTimeSeparator}$4:$5:$6`);
    return dateString;
  }
  static formatDateTime(value: string): string {
    const dateString = DateTimePipe.toDateTimeString(value);
    if (dateString === '') {
      return '';
    }
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  transform(value: any, _?: any): any {
    return DateTimePipe.formatDateTime(value);
  }

}
