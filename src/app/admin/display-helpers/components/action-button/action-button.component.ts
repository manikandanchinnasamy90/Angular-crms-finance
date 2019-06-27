import { Component, Input, OnInit } from '@angular/core';
import { IActionOptions } from '../../models/export-models';
import { ApiModelBase } from '../../../resources/bank-api/bank-api.module';
import { AuthService } from 'src/app/auth.service';

/**
 * @description Component that adds a button for a IActionOptions including loading and results
 *
 * @see IActionOptions
 */
@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss']
})
export class ActionButtonComponent<T extends ApiModelBase> implements OnInit {

  /**
   * @description The action details
   */
  @Input()
  public actionOption: IActionOptions;

  /**
   * @description The item the action is on. This will be passed to the handler
   */
  @Input()
  public item: T;

  /**
   * @description Whether the action handler is busy executing
   */
  public loading = false;

  /**
   * @description Whether the button should be hidden
   */
  public hidden = false;

  /**
   * @description Whether the handles was successful or not
   */
  public result: boolean = null;

  /**
   * @description The message returned by the handled on error
   */
  public resultMessage: string = null;

  /**
   * @description Constructor
   */
  constructor(private authService: AuthService) { }

  /**
   * @description Method to action the handler (called on button click)
   */
  public async handleClick() {
    this.loading = true;
    this.result = null;
    this.resultMessage = null;

    const result = await this.actionOption.handler(this.item);
    if (result === true) {
      this.result = true;
    } else {
      this.result = false;
      if (typeof result === 'string') {
        this.resultMessage = result;
      }
    }

    this.loading = false;
  }

  /**
   * @description Angular life cycle hook
   */
  public ngOnInit(): void {
    if (this.actionOption != null && this.actionOption.scope != null) {
      if (!this.authService.hasScope(this.actionOption.scope)) {
        this.hidden = true;
      }
    }
  }

}
