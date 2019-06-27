import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'app-object-array',
  templateUrl: './object-array.component.html',
  styleUrls: ['./object-array.component.scss']
})
export class ObjectArrayComponent extends FieldArrayType {

  public add() {
    super.add();
    this.field.fieldGroup[this.model.length - 1].formControl.setValue(new this.to.class());
  }
}
