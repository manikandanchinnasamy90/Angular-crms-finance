import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewClassComponent } from './components/view-class/view-class.component';
import { ViewFieldComponent } from './components/view-field/view-field.component';
import { PanelWrapperComponent } from './components/panel-wrapper/panel-wrapper.component';
import { FormlyModule } from '@ngx-formly/core';
import { ValidationMessageHelper } from './helpers/validation-messages.helper';
import { ActionButtonComponent } from './components/action-button/action-button.component';
import { SearchSelectComponent } from './components/search-select/search-select.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewArrayComponent } from './components/view-array/view-array.component';
import { ObjectArrayComponent } from './components/object-array/object-array.component';
import { ViewArrayTableComponent } from './components/view-array-table/view-array-table.component';
import { NgbModalModule, NgbProgressbarModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NoneFormElementComponent } from './components/none-form-element/none-form-element.component';
import { DatePipe } from './pipes/date.pipe';
import { DateTimePipe } from './pipes/dateTime.pipe';
import { CurrencyPipe } from './pipes/currency.pipe.';

/**
 * @description Module with elements related to the display of API models in views and forms
 */
@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    NgbModalModule,
    NgbProgressbarModule,
    NgbAlertModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      wrappers: [
        { name: 'panel', component: PanelWrapperComponent },
      ],
      types: [
        { name: 'searchSelect', component: SearchSelectComponent, wrappers: ['form-field'] },
        { name: 'objectArray', component: ObjectArrayComponent, wrappers: ['form-field'], },
        { name: 'none', component: NoneFormElementComponent, wrappers: ['form-field'], },
      ],
      validationMessages: [
        { name: 'required', message: 'This field is required' },
        { name: 'pattern', message: 'This value is invalid' },
        { name: 'minlength', message: ValidationMessageHelper.minLengthValidationMessage },
        { name: 'maxlength', message: ValidationMessageHelper.maxLengthValidationMessage },
        { name: 'min', message: ValidationMessageHelper.minValidationMessage },
        { name: 'max', message: ValidationMessageHelper.maxValidationMessage },
      ],
    }),
  ],
  declarations: [
    ViewClassComponent,
    ViewFieldComponent,
    ViewArrayComponent,
    ViewArrayTableComponent,
    PanelWrapperComponent,
    ActionButtonComponent,
    SearchSelectComponent,
    ObjectArrayComponent,
    NoneFormElementComponent,
    DatePipe,
    DateTimePipe,
    CurrencyPipe,
  ],
  exports: [
    ViewClassComponent,
    ViewArrayTableComponent,
  ]
})
export class DisplayHelpersModule { }

export * from './models/export-models';
export * from './services/service-exports';
export * from './components/component-exports';
