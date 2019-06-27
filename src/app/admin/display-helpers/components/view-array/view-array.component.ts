import { Component, Input, OnInit } from '@angular/core';
import { IActionOptions } from '../../models/export-models';
import { startCase } from 'lodash';
import { DisplayOptions } from 'src/app/admin/display-decorators/display-decorators.module';

/**
* @description Reusable component to display a array of a API model class based on the display decorators
* used
* @see `DisplayDecorator`
*/
@Component({
  selector: 'app-view-array',
  templateUrl: './view-array.component.html',
  styleUrls: ['./view-array.component.scss']
})
export class ViewArrayComponent implements OnInit {

  /**
   * @description Options that determine if specific classes should include a action button
   */
  @Input()
  public actionOptions: IActionOptions[];

  /**
   * @description The display options, as set by the decorator that determines how a value should be displayed
   */
  @Input()
  public metaData: DisplayOptions;

  /**
   * @description Value that should be displayed
   */
  @Input()
  public value: any;

  /**
   * @description Action options that are relevant to the current item to view. This is populated in the
   * constructor
   * @see actionOptions
   */
  public relevantActionOptions: IActionOptions[];

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
   * @description Constructor
   * @param referenceDataService Injected service
   * @param router Injected service
   */
  constructor() {

  }

  /**
   * @description Angular init method. Loads the display values through the reference API
   */
  ngOnInit(): void {

    // load action options
    this.checkActionOptions();
  }

  /**
   * @description Get the variables in the current object that should be passed to the reference
   * data api service
   */
  public getPathValues(metaData: DisplayOptions, value: any): Array<{ name: string, value: string }> {
    if (metaData.referenceDataPathVariables == null) {
      return null;
    }

    return metaData.referenceDataPathVariables.map((m) => {
      return { name: m.name, value: value[m.pathInObject] == null ? null : value[m.pathInObject].toString() };
    });
  }

  /**
   * @description Check which action options are relevant to the current object being viewed
   */
  private checkActionOptions() {
    if (this.actionOptions == null) {
      this.relevantActionOptions = [];
      return;
    }

    this.relevantActionOptions = this.actionOptions.filter((o) => {
      return o.navigationObject === this.metaData.class;
    });
  }
}
