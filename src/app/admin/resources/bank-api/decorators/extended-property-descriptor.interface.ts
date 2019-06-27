import { IHeaderDecoratorOptions } from './header-decorator-options.interface';

/**
 * @description Extension of default property description to allow for custom values used in decorators
 */
export interface IExtendedPropertyDescriptor extends PropertyDescriptor {

  /**
   * @description Custom header options used in decorators
   *
   * @see addHead
   */
  headerOptions?: Array<IHeaderDecoratorOptions<any>>;
}
