import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { QueryParametersService } from './query-parameters.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscriber, Observable } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

@Component({ template: '' })
export class StubComponent {

}

describe('QueryParametersService', () => {
  let routeObserver: Subscriber<Map<string, any>>;
  beforeEach(() => {
    const routeObservable = new Observable<Map<string, any>>((o) => {
      routeObserver = o;
    });
    const activatedRouteStub = {

      firstChild: {
        firstChild: {
          firstChild: {
            queryParamMap: routeObservable,
          }
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{
          path: 'path/:userId',
          component: StubComponent
        }])
      ],
      declarations: [
        StubComponent
      ],
      providers: [
        QueryParametersService,
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        }
      ]
    });
  });

  it('should be created', inject([QueryParametersService], (service: QueryParametersService) => {
    expect(service).toBeTruthy();
  }));

  describe('router event change', () => {
    let service: QueryParametersService;
    beforeEach(inject([QueryParametersService], (_service: QueryParametersService) => {
      service = _service;
    }));

    it('Should set query parameters from activated router last child parameters', fakeAsync(() => {
      // arrange
      const queryParameters = new Map<string, any>();
      queryParameters.set('test', '1');
      const router = TestBed.get(Router);

      // act
      router.navigate(['path', 'testToTriggerRouting']);
      tick();
      routeObserver.next(queryParameters);

      // assert
      expect(service['_parameters']).toBe(queryParameters as any as ParamMap);

    }));
  });

  describe('getQueryParameter', () => {
    it('should return the parameter when it exists', inject([QueryParametersService], (service: QueryParametersService) => {
      // arrange
      const params = new Map<string, any>();
      params.set('test', '123');
      service['_parameters'] = params as any as ParamMap;

      // act
      const result = service.getQueryParameter('test');

      // assert
      expect(result).toBe('123');
    }));

    it('should return null if parameter does not exist', inject([QueryParametersService], (service: QueryParametersService) => {
      // arrange
      const params = new Map<string, any>();
      params.set('test2', '123');
      service['_parameters'] = params as any as ParamMap;

      // act
      const result = service.getQueryParameter('test');

      // assert
      expect(result).toBeNull();
    }));

    it('should return null when parameters have not been set', inject([QueryParametersService], (service: QueryParametersService) => {
      // arrange
      service['_parameters'] = null;

      // act
      const result = service.getQueryParameter('test');

      // assert
      expect(result).toBeNull();
    }));
  });

  describe('currentSearchPage', () => {
    it('should return page number from query parameters', inject(
      [QueryParametersService], (service: QueryParametersService) => {
        // arrange
        spyOn(service, 'getQueryParameter').and.returnValue('123');

        // act
        const result = service.currentSearchPage;

        // assert
        expect(result).toBe(123);
        expect(service.getQueryParameter).toHaveBeenCalledWith('pageNumber');
      }));

    it('should return 0 if query parameter is not set', inject(
      [QueryParametersService], (service: QueryParametersService) => {
        // arrange
        spyOn(service, 'getQueryParameter').and.returnValue(null);

        // act
        const result = service.currentSearchPage;

        // assert
        expect(result).toBe(0);
        expect(service.getQueryParameter).toHaveBeenCalledWith('pageNumber');
      }));

    it('should return NaN when parse fails', inject(
      [QueryParametersService], (service: QueryParametersService) => {
        // arrange
        spyOn(service, 'getQueryParameter').and.returnValue('test');

        // act
        const result = service.currentSearchPage;

        // assert
        expect(result).toEqual(NaN);
        expect(service.getQueryParameter).toHaveBeenCalledWith('pageNumber');
      }));
  });
});
