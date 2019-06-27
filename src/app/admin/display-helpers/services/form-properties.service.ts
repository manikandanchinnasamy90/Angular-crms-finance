import { Injectable } from '@angular/core';
import { FormPropertyTypes } from '../models/form-property-types.enum';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { tap } from 'rxjs/operators';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { DisplayOptions, PropertyTypes } from '../../display-decorators/display-decorators.module';
import { Observable, of, Subscription } from 'rxjs';
import { ApiFormBaseComponent } from '../display-helpers.module';
import { ApiModelBase } from '../../resources/bank-api/bank-api.module';
import { find } from 'lodash';

/**
 * @description Service that can be used to get properties metadata that can be used with Formly
 */
@Injectable({
  providedIn: 'root'
})
export class FormPropertiesService {

  constructor(private referenceDataService: ReferenceDataService) { }


  /**
   * @description Get the form options for a form for a given path
   *
   * @param formComponent The current form that should be searched
   * @param path the dot separated path to the field
   *
   * @returns The form options for the given field
   */
  public getFormOptionsForField<T extends ApiModelBase, U extends ApiModelBase>(
    formComponent: ApiFormBaseComponent<T, U>,
    path: string,
  ): FormlyFieldConfig {
    const parts = path.split('.');

    let currentObject = formComponent.fields[0];
    parts.forEach((part, i) => {
      currentObject = find(currentObject.fieldGroup, (f: FormlyFieldConfig) => f.key === part);
    });

    return currentObject;
  }

  /**
   * @description Gets properties object that conforms to what formly expects from the display options
   * set through the Display decorator
   * @param displayOptions The display options to translate
   *
   * @see DisplayDecorator
   */
  public displayToFormProperties(displayOptions: DisplayOptions[]): FormlyFieldConfig[] {
    return displayOptions.map((d) => {
      return this.displayToFormProperty(d);
    });
  }

  /**
   * @description Method used to recursively translate display options to formly options
   * @param displayOptions The display options to translate
   */
  private displayToFormProperty(displayOptions: DisplayOptions): FormlyFieldConfig {
    const formOptions = {} as FormlyFieldConfig;
    formOptions.key = displayOptions.key;
    formOptions.templateOptions = displayOptions.templateOptions;
    formOptions.validators = displayOptions.validators;
    formOptions.hooks = displayOptions.hooks;
    formOptions.className = displayOptions.className;
    switch (displayOptions.type) {
      case PropertyTypes.input:
        formOptions.type = FormPropertyTypes.input;
        break;
      case PropertyTypes.select:
        formOptions.type = FormPropertyTypes.select;
        break;
      case PropertyTypes.searchSelect:
        formOptions.type = FormPropertyTypes.searchSelect;
        formOptions.templateOptions.options = new Observable<any[]>();
        if (displayOptions.referenceDataApi != null) {

          // make sure the field is disabled from the start
          formOptions.templateOptions.disabled = true;

          const subscriptions: Subscription[] = [];
          formOptions.lifecycle = {
            onInit: async (form, field): Promise<void> => {
              if (displayOptions.referenceDataPathVariables == null) {
                await this.loadDataFormField(displayOptions, field, formOptions, form);
              } else {
                // subscribe to changes for cascading drop downs
                field.templateOptions.disabled = true;

                displayOptions.referenceDataPathVariables.forEach((p) => {
                  const subscription = form.get(p.pathInObject).valueChanges.pipe(
                    tap(value => {
                      // clear value
                      field.templateOptions.disabled = true;

                      const oldValue = field.formControl.value;
                      field.formControl.setValue(null);

                      // load data
                      if (value == null || value === '') {
                        return;
                      }
                      this.loadDataFormField(displayOptions, field, formOptions, form, oldValue);
                    }),
                  ).subscribe();

                  subscriptions.push(subscription);
                });
              }

            },
            onDestroy: () => {
              subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
              });
            }
          };
        } else if (displayOptions.getDataMethod != null) {
          // make sure the field is disabled from the start
          formOptions.templateOptions.disabled = true;
          formOptions.templateOptions.loading = true;

          formOptions.lifecycle = {
            onInit: async (_form, field) => {
              const data = await displayOptions.getDataMethod();
              field.templateOptions.options = of(data);
              formOptions.templateOptions.loading = false;
              formOptions.templateOptions.disabled = false;
            }
          };
        }
        break;
      case PropertyTypes.checkbox:
        formOptions.type = FormPropertyTypes.checkbox;
        break;
      case PropertyTypes.none:
        formOptions.type = FormPropertyTypes.none;
        break;
      case PropertyTypes.class:
        formOptions.wrappers = ['panel'];
        formOptions.fieldGroup = [];
        if (displayOptions.childOptions != null) {
          displayOptions.childOptions.forEach((childDisplayOptions) => {
            formOptions.fieldGroup.push(this.displayToFormProperty(childDisplayOptions));
          });
        }
        break;
      case PropertyTypes.array:
        if (displayOptions.class != null) {
          formOptions.wrappers = ['panel'];
          formOptions.type = FormPropertyTypes.objectArray;
          formOptions.fieldArray = { fieldGroup: [] };
          formOptions.fieldArray.fieldGroup = displayOptions.childOptions == null ?
            null : this.displayToFormProperties(displayOptions.childOptions);
          formOptions.templateOptions.class = displayOptions.class;
        } else {
          console.warn(`Unsupported array of basic type`);
        }
        break;
      default:
        console.warn(`Unsupported entry type ${displayOptions.type}`);
        break;
    }

    return formOptions;
  }

  private async loadDataFormField(
    displayOptions: DisplayOptions,
    field: FormlyFieldConfig,
    formOptions: FormlyFieldConfig,
    form: FormGroup,
    defaultValue?: string | number): Promise<void> {

    field.templateOptions.disabled = true;
    field.templateOptions.loading = true;

    // clear all options (placeholder and all)
    field.templateOptions.placeholder = null;
    field.templateOptions.options = of([]);

    let dataArray = await this.getFieldReferenceData(displayOptions, form);
    if (dataArray == null) {
      field.templateOptions.loading = false;
      return;
    }

    if (displayOptions.referenceDataFilter != null) {
      dataArray = dataArray.filter(displayOptions.referenceDataFilter);
    }

    field.templateOptions.options = of(dataArray);
    if (defaultValue != null &&
      dataArray.some((v) => v[displayOptions.templateOptions.valueProp] === defaultValue)) {
      field.formControl.setValue(defaultValue);
    }

    field.templateOptions.loading = false;
    field.templateOptions.disabled = false;
  }

  public async getFieldReferenceData(displayOptions: DisplayOptions, form: FormGroup): Promise<any[]> {
    let options: Array<{ name: string, value: string }> = null;

    if (displayOptions.referenceDataPathVariables != null) {
      options = this.getPathValues(displayOptions, form);
      if (options == null) {

        return null;
      }
    }

    const result = await this.referenceDataService.getAll({
      endpoint: displayOptions.referenceDataApi,
      properties: options,
      type: displayOptions.referenceDataReturnType
    });
    const pathParts = displayOptions.referenceDataPath == null ? [] : displayOptions.referenceDataPath.split('.');
    let data = result;
    pathParts.forEach((p) => {
      if (data != null) {
        data = data[p];
      }
    });

    let dataArray: any[] = [];
    if (data instanceof Array) {
      dataArray = data;
    } else if (data != null) {
      dataArray = new Array(data);
    }

    return dataArray;
  }

  /**
   * @description Get the variables in the current object that should be passed to the reference
   * data api service
   */
  private getPathValues(metaData: DisplayOptions, form: FormGroup): Array<{ name: string, value: string }> {
    if (metaData.referenceDataPathVariables == null) {
      return null;
    }

    return metaData.referenceDataPathVariables.map((m) => {

      return { name: m.name, value: form.value[m.pathInObject] == null ? null : form.value[m.pathInObject].toString() };
    });
  }
}
