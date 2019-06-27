import { Component, DoCheck } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-field-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss']
})
export class SearchSelectComponent extends FieldType implements DoCheck {
  public currentValue;

  public onChange(value) {
    if (value == null) {
      this.field.formControl.setValue(null);
    } else {
      this.field.formControl.setValue(value[this.to.valueProp]);
    }
  }

  public onClear() {
    this.field.formControl.setValue(null);
  }

  ngDoCheck() {
    if (this.currentValue !== this.field.formControl.value) {
      this.currentValue = this.field.formControl.value;
    }
  }

  customSearch = (term: string, item: any) => {
    term = term.toLocaleLowerCase();
    return item[this.to.labelProp].toLocaleLowerCase().indexOf(term) > -1
      || item[this.to.valueProp].toString().toLocaleLowerCase().indexOf(term) > -1;
  }
}
