import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Mutex, MutexInterface } from 'async-mutex';

/**
 * @description Service to make it easier to read data from the reference data API
 */
@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  private _cache: Map<string, any> = new Map<string, any>();
  private _que: Map<string, Mutex> = new Map<string, Mutex>();
  constructor(private httpClient: HttpClient) {
  }

  /**
   * @description Get all options from the reference API
   * @param endpoint Endpoint of the reference data API
   */
  public async getAll<T>(options: {
    endpoint: string,
    properties?: Array<{ name: string, value: string }>,
    type: new (any) => T,
    skipCache?: boolean
  }): Promise<T> {
    let endpointToUse = options.endpoint;

    if (options.properties != null) {
      // prep url
      options.properties.forEach((p) => {
        endpointToUse = endpointToUse.replace(`{${p.name}}`, p.value);
      });
    }

    if (options.skipCache) {
      this.setCache(endpointToUse, null);
    }

    const releaser = await this.waitForQue(endpointToUse);
    const data = await this.getData(endpointToUse, options.type);
    this.releaseQuey(releaser);
    return data;
  }

  /**
   * @description Helper method to get headers for the request
   */
  private getHeaders(): HttpHeaders {
    let httpHeader = new HttpHeaders();
    httpHeader = httpHeader.append('Content-Type', 'application/json');
    httpHeader = httpHeader.append('Accept', 'application/json');
    return httpHeader;
  }

  /**
   * @description Build the URI based on passed variables
   * @param endpoint Endpoint passed to the get methods
   * @param value Optional value to get
   */
  private getUri(endpoint: string, value?: string | number): string {
    const valuePath = value == null ? '' : `/${value}`;
    return `${environment.apiUrl}/${environment.referenceDataContext}/${endpoint}${valuePath}`;
  }

  private getFromCache<T>(endpoint: string): T | null {
    if (!this._cache.has(endpoint)) {
      return null;
    }

    return this._cache.get(endpoint);
  }

  private setCache<T>(endpoint: string, value: T) {
    this._cache.set(endpoint, value);
  }

  private getData<T>(endpoint: string, type: new (any) => T): Promise<T> {
    return new Promise<T>((resolve, _reject) => {
      const cachedValue = this.getFromCache<T>(endpoint);
      if (cachedValue != null) {
        resolve(cachedValue);
        return;
      }
      this.httpClient.get<T>(this.getUri(endpoint), { headers: this.getHeaders() })
        .toPromise()
        .catch((error: HttpErrorResponse) => {
          console.error(error);
          resolve(null);
        })
        .then((response: T) => {
          if (response == null) {
            resolve(null);
            return;
          }
          const object = new type(response);
          this.setCache(endpoint, object);
          resolve(object);
        });
    });
  }

  private async waitForQue(endpoint: string): Promise<MutexInterface.Releaser> {
    let mutex: Mutex;

    if (this._que.has(endpoint)) {
      // use saved mutex
      mutex = this._que.get(endpoint);
    } else {
      // add mutex to que
      mutex = new Mutex();
      this._que.set(endpoint, mutex);
    }

    const releaser = await mutex.acquire();
    return releaser;
  }

  private releaseQuey(releaser: MutexInterface.Releaser) {
    releaser();
  }
}
