import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscriber, Observable } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { RouteParametersService } from './route-parameters.service';

@Component({ template: '' })
export class StubComponent {

}

describe('RouteParameterService', () => {
  let routeObserver: Subscriber<Map<string, any>>;
  beforeEach(() => {
    const routeObservable = new Observable<Map<string, any>>((o) => {
      routeObserver = o;
    });
    const activatedRouteStub = {

      firstChild: {
        firstChild: {
          firstChild: {
            paramMap: routeObservable,
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
        RouteParametersService,
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        }
      ]
    });
  });

  it('should be created', inject([RouteParametersService], (service: RouteParametersService) => {
    expect(service).toBeTruthy();
  }));

  describe('router event change', () => {
    let service: RouteParametersService;
    beforeEach(inject([RouteParametersService], (_service: RouteParametersService) => {
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

    it('should use observable to subscribe to', fakeAsync(() => {
      // arrange
      let firstChange = false;
      let secondChange = false;
      service.changes.subscribe(() => {
        firstChange = true;
      });

      service.changes.subscribe(() => {
        secondChange = true;
      });

      const queryParameters = new Map<string, any>();
      queryParameters.set('test', '1');
      const router = TestBed.get(Router);

      // act
      router.navigate(['path', 'testToTriggerRouting']);
      tick();
      routeObserver.next(queryParameters);
      tick();

      // assert
      expect(service['_parameters']).toBe(queryParameters as any as ParamMap);
      expect(firstChange).toBeTruthy();
      expect(secondChange).toBeTruthy();
    }));
  });

  describe('getRouteParameter', () => {
    it('should return the parameter when it exists', inject([RouteParametersService], (service: RouteParametersService) => {
      // arrange
      const params = new Map<string, any>();
      params.set('test', '123');
      service['_parameters'] = params as any as ParamMap;

      // act
      const result = service.getRouteParameter('test');

      // assert
      expect(result).toBe('123');
    }));

    it('should return null if parameter does not exist', inject([RouteParametersService], (service: RouteParametersService) => {
      // arrange
      const params = new Map<string, any>();
      params.set('test2', '123');
      service['_parameters'] = params as any as ParamMap;

      // act
      const result = service.getRouteParameter('test');

      // assert
      expect(result).toBeNull();
    }));

    it('should return null when parameters have not been set', inject([RouteParametersService], (service: RouteParametersService) => {
      // arrange
      service['_parameters'] = null;

      // act
      const result = service.getRouteParameter('test');

      // assert
      expect(result).toBeNull();
    }));
  });

  describe('getRouteNumberParameter', () => {
    it('should return the parameter when it is a number', inject([RouteParametersService], (service: RouteParametersService) => {
      // arrange
      const params = new Map<string, any>();
      params.set('test', '123');
      service['_parameters'] = params as any as ParamMap;

      // act
      const result = service.getRouteNumberParameter('test');

      // assert
      expect(result).toBe(123);
    }));

    it('should return null if parameter does not exist', inject([RouteParametersService], (service: RouteParametersService) => {
      // arrange
      const params = new Map<string, any>();
      params.set('test2', '123');
      service['_parameters'] = params as any as ParamMap;

      // act
      const result = service.getRouteNumberParameter('test');

      // assert
      expect(result).toBeNull();
    }));

    it('should return null when parameters is not a number', inject([RouteParametersService], (service: RouteParametersService) => {
      // arrange
      const params = new Map<string, any>();
      params.set('test', 'not a number');
      service['_parameters'] = params as any as ParamMap;

      // act
      const result = service.getRouteNumberParameter('test');

      // assert
      expect(result).toBeNull();
    }));
  });

});
