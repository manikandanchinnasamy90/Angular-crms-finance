import { ApiModelBase } from '../../resources/bank-api/bank-api.module';
import { Scopes } from 'src/app/scopes.enum';

/**
 * @description Action options that can be passed to view class component to add actions on a class
 *
 * @see ViewClassComponent
 */
export interface IActionOptions {
  /**
   * @description Class that should get the action button
   */
  navigationObject: (new () => ApiModelBase);

  /**
   * @description Async action button click handler
   */
  handler: (object: ApiModelBase) => Promise<boolean | string> | void;

  /**
   * @description Text that should be displayed on the button
   */
  buttonText: string;

  /**
   * @description CSS class that should be added to the button. Use bootstrap classes
   */
  buttonClass: string;

  /**
   * @description The scopes who are allowed to see the button
   */
  scope?: Scopes;
}
