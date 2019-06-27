import { environment } from '../../../../../environments/environment';
import { BankApiModule } from '../bank-api.module';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core/testing';
import { Injector, Type } from '@angular/core';
import { ApiModelBase } from '../models/api-model-base';
import { InjectorFactory } from './injector-factory';
import { ApiHelper } from './api-helper';
import { IExtendedPropertyDescriptor } from './extended-property-descriptor.interface';
import { CorporatePlusOnceOffPaymentResponse } from '../models/model-exports';

describe('ApiHelper', () => {
    class TestClass extends ApiModelBase {
        val = '';
    }
    describe('getUri', () => {
        it('should set values in endpoint definition', () => {
            // arrange
            let args: IArguments = null;
            function setArgs(a, b, c) {
                args = arguments;
            }

            setArgs('test', 'test2', 'test3');

            // act
            const url = ApiHelper.getUri('context', 'endpoint/{0}/{1}/{2}', args);

            // assert
            expect(url).toBe(`${environment.apiUrl}/context/endpoint/test/test2/test3`);
        });

        it('should set handle missing arguments', () => {
            // arrange
            let args: IArguments = null;
            function setArgs(a, b) {
                args = arguments;
            }

            setArgs('test', 'test2');

            // act
            const url = ApiHelper.getUri('context', 'endpoint/{3}/{0}/{2}-{1}/{2}/{500}', args);

            // assert
            expect(url).toBe(`${environment.apiUrl}/context/endpoint/null/test/null-test2/null/{500}`);
        });

        it('should set handle too many arguments', () => {
            // arrange
            let args: IArguments = null;
            function setArgs(a, b, c) {
                args = arguments;
            }

            setArgs('test', 'test2', 'test3');

            // act
            const url = ApiHelper.getUri('context', 'endpoint/{0}/{1}', args);

            // assert
            expect(url).toBe(`${environment.apiUrl}/context/endpoint/test/test2`);
        });

        it('should set handle null arguments', () => {
            // arrange
            let args: IArguments = null;
            function setArgs(a, b, c) {
                args = arguments;
            }

            setArgs('test', 'test2', null);

            // act
            const url = ApiHelper.getUri('context', 'endpoint/{0}/{1}/{2}', args);

            // assert
            expect(url).toBe(`${environment.apiUrl}/context/endpoint/test/test2/null`);
        });

        it('should set handle not string arguments', () => {
            // arrange
            let args: IArguments = null;
            function setArgs(a, b, c) {
                args = arguments;
            }

            setArgs('test', 'test2', { test: 123 });

            // act
            const url = ApiHelper.getUri('context', 'endpoint/{0}/{1}/{2}', args);

            // assert
            expect(url).toBe(`${environment.apiUrl}/context/endpoint/test/test2/[object Object]`);
        });
    });

    describe('getBody', () => {
        it('should get last argument', () => {
            // arrange
            const object = { test: 123, toServerObject: () => { } } as any as ApiModelBase;
            const cleanObject = { test: 123 } as any as ApiModelBase;
            spyOn(object, 'toServerObject').and.returnValue(cleanObject);

            let args: IArguments = null;
            function setArgs(a, b, c) {
                args = arguments;
            }

            setArgs('test', 'test2', object);

            // act
            const body = ApiHelper.getBody(args);

            // assert
            expect(body).toBe(cleanObject);
        });

        it('should handle no arguments', () => {
            // arrange
            let args: IArguments = null;
            function setArgs() {
                args = arguments;
            }

            setArgs();

            // act
            const body = ApiHelper.getBody(args);

            // assert
            expect(body).toBe(undefined);
        });

        it('should check for incompatible types', () => {
            // arrange
            let args: IArguments = null;
            function setArgs(a, b) {
                args = arguments;
            }

            setArgs('123', '123');

            // act
            const body = ApiHelper.getBody(args);

            // assert
            expect(body).toBeNull();
        });

        it('should handle null classes', () => {
            // arrange
            const object = new CorporatePlusOnceOffPaymentResponse();
            object.result = undefined;

            let args: IArguments = null;
            function setArgs(a, b, c) {
                args = arguments;
            }

            setArgs('test', 'test2', object);

            // act
            ApiHelper.getBody(args);

            // assert
            expect(object.result).toBeUndefined();
        });
    });

    describe('getHeaders', () => {
        it('should set json content type', () => {
            // act
            const header = ApiHelper.getHeaders();

            // assert
            expect(header.has('Content-Type')).toBeTruthy();
            expect(header.get('Content-Type')).toBe('application/json');
        });

        it('should set headers from the descriptor', () => {
            // arrange
            const decorator: IExtendedPropertyDescriptor = {
                headerOptions: [
                    {
                        header: 'test1',
                        value: {
                            // use string instead of types to make mocking Injector easier
                            service: 'TestService1' as any as Type<any>, property: 'value'
                        }
                    },
                    {
                        header: 'test2',
                        value: {
                            // use string instead of types to make mocking Injector easier
                            service: 'TestService2' as any as Type<any>, property: 'value'
                        }
                    }
                ]
            };

            InjectorFactory.InjectorInstance = jasmine.createSpyObj('Injector', ['get']);

            // tslint:disable-next-line:deprecation
            (InjectorFactory.InjectorInstance.get as jasmine.Spy).and.callFake((token) => {
                if (token === 'TestService1') {
                    return {
                        value: 'val1',
                    };
                }

                if (token === 'TestService2') {
                    return {
                        value: 'val2',
                    };
                }
            });

            // act
            const header = ApiHelper.getHeaders(decorator);

            // assert

            expect(header.has('test1')).toBeTruthy();
            expect(header.get('test1')).toBe('val1');
            expect(header.has('test2')).toBeTruthy();
            expect(header.get('test2')).toBe('val2');
        });
    });

    describe('getHttpClient', () => {
        it('should get HttpClient from the injector', inject([Injector], (injector: Injector) => {
            // arrange
            const httpClientMock = {} as any as HttpClient;

            // set InjectorInstance
            const module = new BankApiModule(injector);
            expect(module).not.toBeNull();

            let requestType;
            spyOn(InjectorFactory.InjectorInstance, 'get').and.callFake((requestedType) => {
                requestType = requestedType;
                return httpClientMock;
            });

            // act
            const httpInstance = ApiHelper.getHttpClient();

            // assert
            expect(requestType).toBe(HttpClient);
            expect(httpInstance).toBe(httpClientMock);
        }));
    });

    describe('callApi', () => {

        it('should handle success scenario', async () => {
            // arrange
            const httpMock = {
                request: () => { }
            } as any as HttpClient;

            const data = { val: 'test' };

            spyOn(httpMock, 'request').and.returnValue({
                toPromise: () => {
                    return Promise.resolve(data);
                }
            });

            const headers = new HttpHeaders();

            // act
            const result = await ApiHelper.callApi(httpMock, 'uri', 'POST', headers, 'body' as any, TestClass);

            // assert
            expect(httpMock.request).toHaveBeenCalledWith('POST', 'uri', { body: 'body', headers: headers });
            expect(result.success).toBeTruthy();
            expect(result.data.val).toBe('test');
            expect(result.data instanceof TestClass).toBeTruthy();
            expect(result.error).toBeNull();
        });

        it('should handle success scenario where data is null', async () => {
            // arrange
            const httpMock = {
                request: () => { }
            } as any as HttpClient;

            const data = null;

            spyOn(httpMock, 'request').and.returnValue({
                toPromise: () => {
                    return Promise.resolve(data);
                }
            });

            const headers = new HttpHeaders();

            // act
            const result = await ApiHelper.callApi(httpMock, 'uri', 'POST', headers, 'body' as any, TestClass);

            // assert
            expect(httpMock.request).toHaveBeenCalledWith('POST', 'uri', { body: 'body', headers: headers });
            expect(result.success).toBeFalsy();
            expect(result.data).toBeNull();
            expect(result.error.message).toBe('Could not retrieve any data from the sever. Please try again.');
        });

        it('should handle error scenario', async () => {
            // arrange
            const httpMock = {
                request: () => { }
            } as any as HttpClient;
            const error = {} as any as HttpErrorResponse;

            spyOn(httpMock, 'request').and.returnValue({
                toPromise: () => {
                    return Promise.reject(error);
                }
            });

            const headers = new HttpHeaders();

            // act
            const result = await ApiHelper.callApi(httpMock, 'uri', 'POST', headers, 'body' as any, TestClass);

            // assert
            expect(httpMock.request).toHaveBeenCalledWith('POST', 'uri', { body: 'body', headers: headers });
            expect(result.success).toBeFalsy();
            expect(result.data).toBeNull();
            expect(result.error).toBe(error);
        });

        it('should handle return type of null', async () => {
            // arrange
            const httpMock = {
                request: () => { }
            } as any as HttpClient;

            const data = null;

            spyOn(httpMock, 'request').and.returnValue({
                toPromise: () => {
                    return Promise.resolve(data);
                }
            });

            const headers = new HttpHeaders();

            // act
            const result = await ApiHelper.callApi(httpMock, 'uri', 'POST', headers, 'body' as any, null);

            // assert
            expect(httpMock.request).toHaveBeenCalledWith('POST', 'uri', { body: 'body', headers: headers });
            expect(result.success).toBeTruthy();
            expect(result.data).toBeNull();
            expect(result.error).toBeNull();
        });
    });
});
