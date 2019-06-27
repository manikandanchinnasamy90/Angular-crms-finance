import { Type } from '@angular/core';

/**
 * @description Used to define which headers to set as part of @see addHead decorator
 */
export interface IHeaderDecoratorOptions<TService> {
    /**
     * @description Http header to set
     */
    header: string;

    /**
     * @description Where to read the value. Define the service to read and the property on the service
     * This value will be read at time when the API is called
     */
    value: { service: Type<TService>, property: keyof TService };
}
