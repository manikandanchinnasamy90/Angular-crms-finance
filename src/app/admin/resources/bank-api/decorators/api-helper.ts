import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ServiceResponse } from '../models/service-response';
import { environment } from '../../../../../environments/environment';
import { ApiModelBase } from '../models/api-model-base';
import { InjectorFactory } from './injector-factory';
import { IExtendedPropertyDescriptor } from './extended-property-descriptor.interface';
import { includes, replace } from 'lodash';

/**
 * @description Helper class with method used as part of the api decorators
 *
 * @see ApiDecorators
 */
export class ApiHelper {
  /**
   * @description Get the uri and replace optional variables
   * @param endpoint The API endpoint to call
   * @param args Arguments to replace in the endpoint
   *
   * @example
   * The endpoint can include {0} for elements to replace e.g. users{0}/{1}.
   */
  static getUri(context: string, endpoint: string, args: IArguments): string {
    let filledEndpoint = endpoint;
    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      if (arg == null) {
        arg = 'null';
      }
      filledEndpoint = filledEndpoint.replace(`{${i}}`, arg.toString());
    }

    let extraCounter = args.length;
    while (includes(filledEndpoint, `{${extraCounter}}`)) {
      filledEndpoint = replace(filledEndpoint, new RegExp(`\\{${extraCounter}}`, 'g'), 'null');
      extraCounter++;
    }

    return `${environment.apiUrl}/${context}/${filledEndpoint}`;
  }

  /**
   * @description Get the body from given arguments. Get the last argument
   * @param args arguments passed to function
   */
  static getBody<TObject extends ApiModelBase>(args: IArguments): TObject {
    const value = args[args.length - 1] as TObject;
    if (value == null) {
      return value;
    }

    if (value.toServerObject == null) {
      return null;
    }

    return value.toServerObject();
  }

  /**
   * @description Get headers for a API call
   * @param descriptor Descriptor set through a decorator to add more header options. The values are read from services
   */
  static getHeaders(descriptor?: IExtendedPropertyDescriptor): HttpHeaders {
    let httpHeader = new HttpHeaders();
    httpHeader = httpHeader.append('Content-Type', 'application/json');
    if (descriptor != null && descriptor.headerOptions != null) {
      descriptor.headerOptions.forEach((d) => {
        const service = InjectorFactory.InjectorInstance.get(d.value.service);
        const value = service[d.value.property];
        httpHeader = httpHeader.append(d.header, value);
      });
    }
    return httpHeader;
  }

  /**
   * @description Get the HTTP client from a injector
   */
  static getHttpClient(): HttpClient {
    return InjectorFactory.InjectorInstance.get<HttpClient>(HttpClient);
  }

  /**
   * Call the actual api
   * @param httpClient Angular HTTP client
   * @param uri The endpoint to call
   * @param method HTTP method (get, post, put, delete)
   * @param headers headers to add to the HTTP call
   * @param body body of the post or put request
   * @param type the initializer for the return object
   */
  static callApi<TResponse extends ApiModelBase | null, TBody extends ApiModelBase | void>(
    httpClient: HttpClient,
    uri: string,
    method: 'POST' | 'PUT' | 'GET' | 'DELETE',
    headers: HttpHeaders,
    body: TBody,
    type?: (new () => TResponse)): Promise<ServiceResponse<TResponse>> {
    return new Promise<ServiceResponse<TResponse>>((resolve, _reject) => {
      httpClient.request<TResponse>(method, uri, { body: body, headers: headers })
        .toPromise()
        .catch((error: HttpErrorResponse) => {
          resolve({
            success: false,
            error: error,
            data: null,
          });
        })
        .then((responseData) => {
          if (type == null) {
            resolve({
              success: true,
              error: null,
              data: null,
            });
            return;
          }

          if (responseData == null) {
            resolve({
              success: false,
              error: { message: 'Could not retrieve any data from the sever. Please try again.' } as HttpErrorResponse,
              data: null,
            });
          }

          const serverData = new type();
          serverData.fromServerObject(responseData as TResponse);
          resolve({
            success: true,
            error: null,
            data: serverData,
          });
        });
    });
  }
}
