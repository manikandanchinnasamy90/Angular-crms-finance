import { ViewChild, ViewContainerRef, Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

/**
* @description Component that is used by formly to wrap nested forms in. Check formly
* documentation for more details.
*/
@Component({
  selector: 'app-formly-wrapper-panel',
  template: `
    <div class='card mt-3' [hidden]="to.hidden">
      <div class='card-header'>{{ to.label }}</div>
      <div class='card-body' style="overflow: auto">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
})
export class PanelWrapperComponent extends FieldWrapper {
  /**
   * @description This is how Formly sets properties that can be used in the template.
   */
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
}
