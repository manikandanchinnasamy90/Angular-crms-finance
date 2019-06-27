import { Component, OnInit, Input } from '@angular/core';
import { IActionOptions } from '../../models/action-options.interface';
import { ModelHelper, DisplayOptions } from 'src/app/admin/display-decorators/display-decorators.module';

/**
* @description Reusable component to display a API model class based on the display decorators
* used
* @see `DisplayDecorator`
*/
@Component({
  selector: 'app-view-class',
  templateUrl: './view-class.component.html',
  styleUrls: ['./view-class.component.scss']
})
export class ViewClassComponent implements OnInit {

  /**
   * @description The object that should be displayed
   */
  @Input()
  public object: any;

  @Input()
  public displayName: string;

  /**
   * @description Options that determine if specific classes should include a action button
   */
  @Input()
  public actionOptions: IActionOptions[];

  /**
   * @description The meta data of the class set by Object. This optional and will is set during initialization
   */
  @Input()
  public metaData: Array<DisplayOptions>;

  /**
   * @description Get the variables in the current object that should be passed to the reference
   * data api service
   */
  public getPathValues(metaData: DisplayOptions): Array<{ name: string, value: string }> {
    if (metaData.referenceDataPathVariables == null) {
      return null;
    }

    return metaData.referenceDataPathVariables.map((m) => {
      return { name: m.name, value: this.object[m.pathInObject] == null ? null : this.object[m.pathInObject].toString() };
    });
  }

  /**
   * @description Constructor
   */
  constructor() { }

  /**
   * @description Angular initialization. Set the metadata from the model
   */
  ngOnInit() {
    if (this.metaData == null) {
      this.metaData = ModelHelper.GetDisplayProperties(this.object);
    }
  }

}
