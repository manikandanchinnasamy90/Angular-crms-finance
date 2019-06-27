import { ApiModelBase } from '../models/api-model-base';
import { ApiHelper } from './api-helper';
import { IHeaderDecoratorOptions } from './header-decorator-options.interface';
import { IExtendedPropertyDescriptor } from './extended-property-descriptor.interface';

/**
 * @description Decorators that can be used to create API services
 */
export class ApiDecorators {
  /**
   * @description Used to override a method to call the API instead
   * @param endpoint The endpoint to call. Can include placeholders {0}, {1} etc, to replace values in
   * the url. This should match the parameters of the method being decorated
   * @param type The class that is expected to be returned
   */
  public static getApi<TObject extends ApiModelBase>(context: string, endpoint: string, type: (new () => TObject)) {
    return function (_target: any, _propertyKey: string, descriptor: IExtendedPropertyDescriptor) {
      descriptor.value = function () {
        return ApiHelper.callApi<TObject, void>(
          ApiHelper.getHttpClient(),
          ApiHelper.getUri(context, endpoint, arguments),
          'GET',
          ApiHelper.getHeaders(descriptor),
          null,
          type);
      };
    };
  }

  /**
   * @description Used to override a method to call the API instead. The last property in the decorator method will be
   * the body of the request
   * @param endpoint The endpoint to call. Can include placeholders {0}, {1} etc, to replace values in
   * the url. This should match the parameters of the method being decorated
   * @param type The class that is expected to be returned
   */
  public static postApi<TRequest extends ApiModelBase, TResponse extends ApiModelBase>(
    context: string,
    endpoint: string,
    type: (new () => TResponse)
  ) {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      descriptor.value = function () {
        return ApiHelper.callApi<TResponse, TRequest>(
          ApiHelper.getHttpClient(),
          ApiHelper.getUri(context, endpoint, arguments),
          'POST',
          ApiHelper.getHeaders(descriptor),
          ApiHelper.getBody<TRequest>(arguments),
          type);
      };
    };
  }

  /**
   * @description Used to override a method to call the API instead. The last property in the decorator method will be
   * the body of the request
   * @param endpoint The endpoint to call. Can include placeholders {0}, {1} etc, to replace values in
   * the url. This should match the parameters of the method being decorated
   * @param type The class that is expected to be returned
   */
  public static putApi<TRequest extends ApiModelBase, TResponse extends ApiModelBase>(
    context: string,
    endpoint: string,
    type: (new () => TResponse)
  ) {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      descriptor.value = function () {
        return ApiHelper.callApi<TResponse, TRequest>(
          ApiHelper.getHttpClient(),
          ApiHelper.getUri(context, endpoint, arguments),
          'PUT',
          ApiHelper.getHeaders(descriptor),
          ApiHelper.getBody<TRequest>(arguments),
          type);
      };
    };
  }

  /**
   * Used to override a method to call the API instead. The last property in the decorator method will be
   * the body of the request
   * @param endpoint The endpoint to call. Can include placeholders {0}, {1} etc, to replace values in
   * the url. This should match the parameters of the method being decorated
   * @param type The class that is expected to be returned
   */
  public static deleteWithBodyApi<TRequest extends ApiModelBase, TResponse extends ApiModelBase>(
    context: string,
    endpoint: string,
    type: (new () => TResponse)
  ) {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      descriptor.value = function () {
        return ApiHelper.callApi<TResponse, TRequest>(
          ApiHelper.getHttpClient(),
          ApiHelper.getUri(context, endpoint, arguments),
          'DELETE',
          ApiHelper.getHeaders(descriptor),
          ApiHelper.getBody<TRequest>(arguments),
          type);
      };
    };
  }

  /**
   * Used to override a method to call the API instead. The last property in the decorator method will be
   * the body of the request
   * @param endpoint The endpoint to call. Can include placeholders {0}, {1} etc, to replace values in
   * the url. This should match the parameters of the method being decorated
   * @param type The class that is expected to be returned
   */
  public static deleteApi<TResponse extends ApiModelBase | null>(context: string, endpoint: string, type: (new () => TResponse)) {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
      descriptor.value = function () {
        return ApiHelper.callApi<TResponse, null>(
          ApiHelper.getHttpClient(),
          ApiHelper.getUri(context, endpoint, arguments),
          'DELETE',
          ApiHelper.getHeaders(descriptor),
          null,
          type);
      };
    };
  }

  /**
   * Decorator used to add header options to a api call implemented with api decorators
   * @param options The options that specify the header property and service where values can be read
   *
   * @see deleteApi
   * @see getApi
   * @see putApi
   * @see postApi
   */
  public static addHead<TService>(options: IHeaderDecoratorOptions<TService>) {
    return function (_target: any, _propertyKey: string, descriptor: IExtendedPropertyDescriptor) {
      if (descriptor.headerOptions == null) {
        descriptor.headerOptions = [];
      }

      descriptor.headerOptions.push(options);
    };
  }
}
