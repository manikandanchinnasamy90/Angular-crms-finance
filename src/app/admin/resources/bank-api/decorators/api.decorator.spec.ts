import { ApiDecorators } from './api.decorator';
import { ApiModelBase } from '../models/api-model-base';
import { ApiHelper } from './api-helper';
import { IHeaderDecoratorOptions } from './header-decorator-options.interface';
import { IExtendedPropertyDescriptor } from './extended-property-descriptor.interface';

describe('API Decorators', () => {
    class TestClass extends ApiModelBase {
        val = '';
    }

    beforeEach(() => {
        spyOn(ApiHelper, 'getHttpClient').and.returnValue('httpClient');
        spyOn(ApiHelper, 'getUri').and.returnValue('uri');
        spyOn(ApiHelper, 'getHeaders').and.returnValue('headers');
        spyOn(ApiHelper, 'callApi').and.returnValue('result');
        spyOn(ApiHelper, 'getBody').and.returnValue('body');
    });

    describe('getApi', () => {
        it('should call the API helper class', () => {
            // arrange
            const descriptor = {} as PropertyDescriptor;

            // act
            const decoratorFunction = ApiDecorators.getApi('context', 'endpoint', TestClass);
            decoratorFunction({}, '', descriptor);
            const result = descriptor.value('args');

            // assert
            expect(result).toBe('result');
            expect(ApiHelper.callApi).toHaveBeenCalledWith('httpClient', 'uri', 'GET', 'headers', null, TestClass);
            expect(ApiHelper.getUri).toHaveBeenCalledWith('context', 'endpoint', jasmine.any(Object));
            expect(ApiHelper.getHeaders).toHaveBeenCalledWith(descriptor);
        });
    });

    describe('postApi', () => {
        it('should call the API helper class', () => {
            // arrange
            const descriptor = {} as PropertyDescriptor;

            // act
            const decoratorFunction = ApiDecorators.postApi('context', 'endpoint', TestClass);
            decoratorFunction({}, '', descriptor);
            const result = descriptor.value('args');

            // assert
            expect(result).toBe('result');
            expect(ApiHelper.callApi).toHaveBeenCalledWith('httpClient', 'uri', 'POST', 'headers', 'body', TestClass);
            expect(ApiHelper.getUri).toHaveBeenCalledWith('context', 'endpoint', jasmine.any(Object));
            expect(ApiHelper.getHeaders).toHaveBeenCalledWith(descriptor);
        });
    });

    describe('putApi', () => {
        it('should call the API helper class', () => {
            // arrange
            const descriptor = {} as PropertyDescriptor;

            // act
            const decoratorFunction = ApiDecorators.putApi('context', 'endpoint', TestClass);
            decoratorFunction({}, '', descriptor);
            const result = descriptor.value('args');

            // assert
            expect(result).toBe('result');
            expect(ApiHelper.callApi).toHaveBeenCalledWith('httpClient', 'uri', 'PUT', 'headers', 'body', TestClass);
            expect(ApiHelper.getUri).toHaveBeenCalledWith('context', 'endpoint', jasmine.any(Object));
            expect(ApiHelper.getHeaders).toHaveBeenCalledWith(descriptor);
        });
    });

    describe('deleteApi', () => {
        it('should call the API helper class', () => {
            // arrange
            const descriptor = {} as PropertyDescriptor;

            // act
            const decoratorFunction = ApiDecorators.deleteApi('context', 'endpoint', TestClass);
            decoratorFunction({}, '', descriptor);
            const result = descriptor.value('args');

            // assert
            expect(result).toBe('result');
            expect(ApiHelper.callApi).toHaveBeenCalledWith('httpClient', 'uri', 'DELETE', 'headers', null, TestClass);
            expect(ApiHelper.getUri).toHaveBeenCalledWith('context', 'endpoint', jasmine.any(Object));
            expect(ApiHelper.getHeaders).toHaveBeenCalledWith(descriptor);
        });
    });

    describe('deleteWithBodyApi', () => {
        it('should call the API helper class', () => {
            // arrange
            const descriptor = {} as PropertyDescriptor;

            // act
            const decoratorFunction = ApiDecorators.deleteWithBodyApi('context', 'endpoint', TestClass);
            decoratorFunction({}, '', descriptor);
            const result = descriptor.value('args');

            // assert
            expect(result).toBe('result');
            expect(ApiHelper.callApi).toHaveBeenCalledWith('httpClient', 'uri', 'DELETE', 'headers', 'body', TestClass);
            expect(ApiHelper.getUri).toHaveBeenCalledWith('context', 'endpoint', jasmine.any(Object));
            expect(ApiHelper.getHeaders).toHaveBeenCalledWith(descriptor);
        });
    });

    describe('addHead', () => {
        it('should add header options to the descriptor', () => {
            // arrange
            const options = {} as any as IHeaderDecoratorOptions<any>;
            const decorator = {} as any as IExtendedPropertyDescriptor;

            // act
            const decoratorFunction = ApiDecorators.addHead(options);
            decoratorFunction('', '', decorator);

            // assert
            expect(decorator.headerOptions.length).toBe(1);
            expect(decorator.headerOptions[0]).toBe(options);
        });

        it('should append header options to the descriptor', () => {
            // arrange
            const options1 = {} as any as IHeaderDecoratorOptions<any>;
            const options2 = {} as any as IHeaderDecoratorOptions<any>;
            const decorator = { headerOptions: [options1] } as any as IExtendedPropertyDescriptor;

            // act
            const decoratorFunction = ApiDecorators.addHead(options2);
            decoratorFunction('', '', decorator);

            // assert
            expect(decorator.headerOptions.length).toBe(2);
            expect(decorator.headerOptions[0]).toBe(options1);
            expect(decorator.headerOptions[1]).toBe(options2);
        });
    });
});
