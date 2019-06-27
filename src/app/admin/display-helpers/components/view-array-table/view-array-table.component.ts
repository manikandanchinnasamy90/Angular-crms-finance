import { Component } from '@angular/core';
import { ViewArrayComponent } from '../view-array/view-array.component';
import { TemplateOptions } from 'src/app/admin/display-decorators/models/export-models';

/**
* @description Reusable component to display a array of a API model class based on the display decorators
* used
* @see `DisplayDecorator`
*/
@Component({
  selector: 'app-view-array-table',
  templateUrl: './view-array-table.component.html',
  styleUrls: ['./view-array-table.component.scss']
})
export class ViewArrayTableComponent extends ViewArrayComponent {
  public isValid(value: any, templateOptions: TemplateOptions): string {
    let errorMessage = '';
    if (templateOptions.required) {
      errorMessage = value != null ? errorMessage : 'Value is required';
    }
    if (value == null) {
      return errorMessage;
    }

    if (templateOptions.minLength) {
      if (value.toString().length < templateOptions.minLength) {
        return `Minimum length of ${templateOptions.minLength} characters allowed`;
      }
    }

    if (templateOptions.maxLength) {
      if (value.toString().length > templateOptions.maxLength) {
        return `Maximum length of ${templateOptions.maxLength} characters allowed`;
      }
    }

    if (templateOptions.min != null) {
      if (parseFloat(value) < templateOptions.min) {
        return `Minimum value allowed is ${templateOptions.min}`;
      }
    }

    if (templateOptions.max != null) {
      if (parseFloat(value) > templateOptions.max) {
        return `Maximum value allowed is ${templateOptions.max}`;
      }
    }

    if (templateOptions.pattern != null) {
      if (!(templateOptions.pattern as RegExp).test(value.toString())) {
        return `Invalid value`;
      }
    }

    return '';

  }
}
