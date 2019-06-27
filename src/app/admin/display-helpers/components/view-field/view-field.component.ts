import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { startCase } from 'lodash';
import { ReferenceDataService } from '../../../resources/reference-api/services/reference-data.service';
import { DisplayOptions, PropertyTypes } from 'src/app/admin/display-decorators/display-decorators.module';

/**
* @description Reusable component to display a field of a API model class based on the display decorators
* used
* @see `DisplayDecorator`
*/
@Component({
  selector: 'app-view-field',
  templateUrl: './view-field.component.html',
  styleUrls: ['./view-field.component.scss']
})
export class ViewFieldComponent implements OnInit, OnChanges {
  /**
   * @description the display value returned by getter function
   */
  private _displayValue: string = null;

  /**
   * @description The display options, as set by the decorator that determines how a value should be displayed
   */
  @Input()
  public metaData: DisplayOptions;

  /**
  * @description Display only value without label
  */
  @Input()
  public onlyValue = false;

  /**
   * @description Value that should be displayed
   */
  @Input()
  public value: any;

  /**
   * @description values that should be replaced in the reference data URL
   */
  @Input()
  public referenceDataPathValues: Array<{ name: string, value: string }>;

  /**
   * @description The display value. This reads label property from the @see metaData or use the property value in sentence case
   */
  public get displayName(): string {
    if (this.metaData.templateOptions != null && this.metaData.templateOptions.label != null) {
      return this.metaData.templateOptions.label;
    }

    const path = this.metaData.path;
    return startCase(path);
  }

  /**
   * @description Getter for display value
   */
  public get displayValue(): string {
    return this._displayValue;
  }

  /**
   * @description Constructor
   * @param referenceDataService Injected service
   * @param router Injected service
   */
  constructor(private referenceDataService: ReferenceDataService) {

  }

  /**
   * @description Angular init method. Loads the display values through the reference API
   */
  ngOnInit(): void {
    // load the display value from the reference API if necessary
    this.loadDisplayValue();
  }

  /**
   * @description Load the display value from the reference API if necessary
   */
  private async loadDisplayValue(): Promise<void> {
    if (this.value == null || (typeof this.value === 'string' && this.value.trim() === '')) {
      this._displayValue = '-';
      return;
    }

    if (this.metaData.referenceDataApi != null &&
      this.metaData.templateOptions != null &&
      this.metaData.templateOptions.labelProp != null &&
      this.metaData.templateOptions.labelProp != null) {

      this._displayValue = 'Loading...';

      // get reference data
      const result = await this.referenceDataService.getAll({
        endpoint: this.metaData.referenceDataApi,
        properties: this.referenceDataPathValues,
        type: this.metaData.referenceDataReturnType
      });

      const pathParts = this.metaData.referenceDataPath == null ? [] : this.metaData.referenceDataPath.split('.');
      let data = result;
      pathParts.forEach((p) => {
        if (data != null) {
          data = data[p];
        }
      });

      if (data != null && data instanceof Array) {
        const displayValue = data.find((v) => {
          return v[this.metaData.templateOptions.valueProp] === this.value;
        });

        if (displayValue != null) {
          const displayString = displayValue[this.metaData.templateOptions.labelProp];
          if (displayString != null) {
            this._displayValue = displayString;
            return;
          }
        }
      }
    }

    if (this.metaData.type === PropertyTypes.select
      && this.metaData.templateOptions != null
      && this.metaData.templateOptions.options != null) {
      const option = (this.metaData.templateOptions.options as Array<any>)
        .find((p) => p.value === this.value);
      if (option != null) {
        this._displayValue = option.label;
        return;
      }
    }

    this._displayValue = this.value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value != null) {
      this.loadDisplayValue();
    }
  }
}
