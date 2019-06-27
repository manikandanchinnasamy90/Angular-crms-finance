import { TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { ReferenceDataService } from './reference-data.service';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

describe('ReferenceDataService', () => {
  class TestObject {
    result;
    data;
    constructor(object) {
      if (object == null) {
        return;
      }

      this.result = object.result;
      this.data = object.data;
    }
  }

  let httpMock: HttpClient;

  beforeEach(() => {
    httpMock = jasmine.createSpyObj('HttpClient', ['get']);

    spyOn(console, 'error').and.stub();
    TestBed.configureTestingModule({
      providers: [
        ReferenceDataService,
        {
          provide: HttpClient,
          useValue: httpMock
        }
      ],
    });
  });

  it('should be created', inject([ReferenceDataService], (service: ReferenceDataService) => {
    expect(service).toBeTruthy();
  }));

  describe('getAll', () => {
    let service: ReferenceDataService;
    beforeEach(inject([ReferenceDataService], (_service: ReferenceDataService) => {
      service = _service;
    }));
    it('should call the http service', fakeAsync(() => {
      // arrange
      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return Promise.resolve({});
        }
      });

      spyOn(service as any, 'getHeaders').and.returnValue('headers');
      spyOn(service as any, 'getUri').and.returnValue('uri');

      // act
      service.getAll({ endpoint: 'test', properties: [], type: TestObject });
      tick();
      // assert
      expect(service['getUri']).toHaveBeenCalledWith('test');
      expect(service['getHeaders']).toHaveBeenCalledWith();
      expect(httpMock.get).toHaveBeenCalledWith('uri', { headers: 'headers' });

    }));

    it('should return the results from the service', fakeAsync(() => {
      // arrange
      const data = { result: {}, data: [] };

      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return Promise.resolve(data);
        }
      });

      // act
      const p = service.getAll({ endpoint: 'test', properties: [], type: TestObject });

      p.then((result) => {
        // assert
        expect(result).toEqual(new TestObject(data));
      });

      tick();
    }));

    it('should return null when there is an error', fakeAsync(() => {
      // arrange
      const error = new Error('test');
      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return Promise.reject(error);
        }
      });
      (console.error as jasmine.Spy).and.callFake(() => { });

      // act
      const p = service.getAll({ endpoint: 'test', properties: null, type: TestObject });

      p.then((result) => {
        // assert
        expect(result).toEqual(null);
        expect(console.error).toHaveBeenCalledWith(error);
      });

      tick();
    }));

    it('should update uri based on properties input', fakeAsync(() => {
      // arrange
      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return new Promise(() => { });
        }
      });
      spyOn(service as any, 'getHeaders').and.returnValue('headers');
      spyOn(service as any, 'getUri').and.callFake(e => e);

      // act
      service.getAll({
        endpoint: 'endpoint/{test}/{notSet}',
        properties: [{ name: 'test', value: 'value' }, { name: 'ignore', value: '123' }],
        type: TestObject
      });
      tick();

      // assert
      expect(httpMock.get).toHaveBeenCalledWith('endpoint/value/{notSet}', { headers: 'headers' });
    }));

    it('should use cached data', fakeAsync(() => {
      // arrange
      let data = { result: {}, data: [1, 2, 3] };
      const expectedResults = new TestObject(data);

      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return Promise.resolve(data);
        }
      });

      // act
      const p = service.getAll({ endpoint: 'test', properties: [], type: TestObject });

      p.then((result) => {
        // assert
        expect(result).toEqual(expectedResults);

        // get cached data
        data = null;
        const p2 = service.getAll({ endpoint: 'test', properties: [], type: TestObject });

        p2.then((result2) => {
          // assert
          expect(result2).toEqual(expectedResults);
          expect(httpMock.get).toHaveBeenCalledTimes(1);
        });

        tick();
      });

      tick();
    }));

    it('should allow skipping cache', fakeAsync(() => {
      // arrange
      const data = { result: {}, data: [1, 2, 3] };
      const expectedResults = new TestObject(data);

      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return Promise.resolve(data);
        }
      });

      // act
      const p = service.getAll({ endpoint: 'test', properties: [], type: TestObject });

      p.then((result) => {
        // assert
        expect(result).toEqual(expectedResults);

        // get cached data
        const p2 = service.getAll({ endpoint: 'test', properties: [], type: TestObject, skipCache: true });

        p2.then((result2) => {
          // assert
          expect(result2).toEqual(expectedResults);
          expect(httpMock.get).toHaveBeenCalledTimes(2);
        });

        tick();
      });

      tick();
    }));

    it('should not cache data where there is an error', fakeAsync(() => {
      // arrange
      const error = new Error('test');

      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return Promise.reject(error);
        }
      });

      // act
      const p = service.getAll({ endpoint: 'test', properties: [], type: TestObject });

      p.then((result) => {
        // assert
        expect(result).toEqual(null);

        // get cached data
        const p2 = service.getAll({ endpoint: 'test', properties: [], type: TestObject });

        p2.then((result2) => {
          // assert
          expect(result2).toEqual(null);
          expect(httpMock.get).toHaveBeenCalledTimes(2);
        });

        tick();
      });

      tick();
    }));

    it('should que similar requests', fakeAsync(() => {
      // arrange
      const data = { result: {}, data: [1, 2, 3] };

      (httpMock.get as jasmine.Spy).and.returnValue({
        toPromise: () => {
          return Promise.resolve(data);
        }
      });

      // act
      const promises = [];
      promises.push(service.getAll({ endpoint: 'alpha', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'alpha', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'alpha', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'alpha', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'alpha', properties: [], type: TestObject }));

      promises.push(service.getAll({ endpoint: 'beta', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'beta', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'beta', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'beta', properties: [], type: TestObject }));
      promises.push(service.getAll({ endpoint: 'beta', properties: [], type: TestObject }));

      Promise.all(
        promises
      ).then(() => {
        expect(httpMock.get).toHaveBeenCalledTimes(2);
      });

      tick();
    }));
  });

  describe('getHeaders', () => {
    it('should set json content type', inject([ReferenceDataService], (service: ReferenceDataService) => {
      // act
      const header = service['getHeaders']();

      // assert
      expect(header.has('Content-Type')).toBeTruthy();
      expect(header.get('Content-Type')).toBe('application/json');
      expect(header.get('Accept')).toBe('application/json');
    }));
  });

  describe('getUri', () => {
    it('should return full uri from env', inject([ReferenceDataService], (service: ReferenceDataService) => {
      // act
      const uri = service['getUri']('test');

      // assert
      expect(uri).toEqual(environment.apiUrl + '/' + environment.referenceDataContext + '/test');
    }));

    it('should include the passed value in the URI', inject([ReferenceDataService], (service: ReferenceDataService) => {
      // act
      const uri = service['getUri']('test', 'val');

      // assert
      expect(uri).toEqual(environment.apiUrl + '/' + environment.referenceDataContext + '/test/val');
    }));
  });

});
