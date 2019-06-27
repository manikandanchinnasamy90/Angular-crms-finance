import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { AuthenticationInterceptor } from './authentication.interceptor';
import { AuthService} from '../../auth.service';
import { HttpRequest, HttpEvent, HttpHandler, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpHeaderSkipInterceptor, HttpHeaderSkipRefresh } from 'src/app/cookie-management.service';

class AuthServiceMock {
  get isLoggedIn() {
    return false;
  }
  get token() {
    return 'token';
  }

  refreshToken() {

  }
}
describe('AuthenticationInterceptor', () => {


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationInterceptor,
        {
          provide: AuthService, useClass: AuthServiceMock,
        },
        {
          provide: Router, useValue: jasmine.createSpyObj(['navigate'])
        }
      ]
    });
  });

  it('should be created', inject([AuthenticationInterceptor], (service: AuthenticationInterceptor) => {
    expect(service).toBeTruthy();
  }));

  describe('intercept', () => {
    let service: AuthenticationInterceptor;
    let authService: AuthService;
    let router: Router;
    let observer: Subscriber<{}>;
    beforeEach(inject([AuthenticationInterceptor, AuthService, Router], (
      _service: AuthenticationInterceptor,
      _authService: AuthService,
      _router: Router) => {
      service = _service;
      authService = _authService;
      router = _router;

      spyOn(authService, 'refreshToken').and.callFake(() => {
        const observable = new Observable((_observer) => {
          observer = _observer;
        });

        return observable;
      });
    }));

    it('should add authentication in header when logged in after token refresh',
      fakeAsync(() => {
        // arrange
        const httpHander: HttpHandler = {
          handle(): Observable<HttpEvent<any>> {
            return null;
          }
        };

        let editedRequest: HttpRequest<any>;
        spyOn(httpHander, 'handle').and.callFake((req: HttpRequest<any>) => {
          editedRequest = req;
          return new Observable<HttpEvent<any>>((o) => { o.next(); });
        });
        const httpRequest = new HttpRequest<any>('GET', 'URL');

        spyOnProperty(authService, 'isLoggedIn', 'get').and.returnValue(true);

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // assert
          expect(editedRequest.headers.has('Authorization')).toBeTruthy();
          expect(editedRequest.headers.get('Authorization')).toBe('Bearer token');
        });
        tick();
        expect(authService.refreshToken).toHaveBeenCalled();
        observer.next({});
      }));

    it('should not add authentication in header when not logged in',
      fakeAsync(() => {
        // arrange
        const httpHander: HttpHandler = {
          handle(): Observable<HttpEvent<any>> {
            return null;
          }
        };

        let editedRequest: HttpRequest<any>;
        spyOn(httpHander, 'handle').and.callFake((req: HttpRequest<any>) => {
          editedRequest = req;
          return new Observable<HttpEvent<any>>((o) => { o.next(); });
        });
        const httpRequest = new HttpRequest<any>('GET', 'URL');

        spyOnProperty(authService, 'isLoggedIn', 'get').and.returnValue(false);

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // assert
          expect(editedRequest.headers.has('Authorization')).toBeFalsy();
        });
        tick();
        expect(authService.refreshToken).not.toHaveBeenCalled();
      }));

    it('should not add header or refresh token when skip header is defined',
      fakeAsync(() => {
        // arrange
        const httpHander: HttpHandler = {
          handle(): Observable<HttpEvent<any>> {
            return null;
          }
        };

        let editedRequest: HttpRequest<any>;
        spyOn(httpHander, 'handle').and.callFake((req: HttpRequest<any>) => {
          editedRequest = req;
          return new Observable<HttpEvent<any>>((o) => { o.next(); });
        });

        let httpHeader = new HttpHeaders();
        httpHeader = httpHeader.append(HttpHeaderSkipInterceptor, '');
        httpHeader = httpHeader.append('Accept', 'application/json');

        const httpRequest = new HttpRequest<any>('GET', 'URL', { headers: httpHeader });

        spyOnProperty(authService, 'isLoggedIn', 'get').and.returnValue(true);

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // assert
          expect(editedRequest.headers.has('Authorization')).toBeFalsy();
          expect(editedRequest.headers.has(HttpHeaderSkipInterceptor)).toBeFalsy();
          expect(editedRequest.headers.get('Accept')).toBe('application/json');
        });
        tick();
        expect(authService.refreshToken).not.toHaveBeenCalled();
      }));

    it('should not add refresh token when refresh skip header is defined',
      fakeAsync(() => {
        // arrange
        const httpHander: HttpHandler = {
          handle(): Observable<HttpEvent<any>> {
            return null;
          }
        };

        let editedRequest: HttpRequest<any>;
        spyOn(httpHander, 'handle').and.callFake((req: HttpRequest<any>) => {
          editedRequest = req;
          return new Observable<HttpEvent<any>>((o) => { o.next(); });
        });

        let httpHeader = new HttpHeaders();
        httpHeader = httpHeader.append(HttpHeaderSkipRefresh, '');
        httpHeader = httpHeader.append('Accept', 'application/json');

        const httpRequest = new HttpRequest<any>('GET', 'URL', { headers: httpHeader });

        spyOnProperty(authService, 'isLoggedIn', 'get').and.returnValue(true);

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // assert
          expect(editedRequest.headers.has('Authorization')).toBeTruthy();
          expect(editedRequest.headers.get('Authorization')).toBe('Bearer token');
          expect(editedRequest.headers.has(HttpHeaderSkipRefresh)).toBeFalsy();
          expect(editedRequest.headers.get('Accept')).toBe('application/json');
        });
        tick();
        expect(authService.refreshToken).not.toHaveBeenCalled();
      }));

    describe('error', () => {
      let httpRequest: HttpRequest<any>;
      let httpHander: HttpHandler;
      let error = new HttpErrorResponse({ status: 401 });
      beforeEach(() => {
        // arrange
        httpHander = {
          handle(): Observable<HttpEvent<any>> {
            return null;
          }
        };

        spyOn(httpHander, 'handle').and.callFake((req: HttpRequest<any>) => {
          return new Observable<HttpEvent<any>>((o) => {

            o.error(error);
          });
        });

        let httpHeader = new HttpHeaders();
        httpHeader = httpHeader.append(HttpHeaderSkipInterceptor, '');
        httpHeader = httpHeader.append('Accept', 'application/json');

        httpRequest = new HttpRequest<any>('GET', 'URL', { headers: httpHeader });

        spyOnProperty(authService, 'isLoggedIn', 'get').and.returnValue(true);
      });

      it('should redirect to login when the API fails', fakeAsync(() => {
        // arrange
        let tested = false;

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // should not end up here
          expect(true).toBeFalsy();
        }, () => {
          // should text
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          tested = true;
        });
        tick();

        expect(tested).toBeTruthy();
      }));

      it('should not redirect for not 401 errors', fakeAsync(() => {
        // arrange
        let tested = false;
        error = new HttpErrorResponse({ status: 400 });

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // should not end up here
          expect(true).toBeFalsy();
        }, () => {
          // should not redirect text
          tested = true;
          expect(router.navigate).not.toHaveBeenCalled();

        });
        tick();

        expect(tested).toBeTruthy();
      }));

      it('should redirect for 400 login request', fakeAsync(() => {
        // arrange
        let tested = false;
        error = new HttpErrorResponse({ status: 400 , url: environment.apiUrl + '/token'});

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // should not end up here
          expect(true).toBeFalsy();
        }, () => {
          // should not redirect text
          tested = true;
          expect(router.navigate).toHaveBeenCalledWith(['/login']);

        });
        tick();

        expect(tested).toBeTruthy();
      }));

      it('should not redirect for not errors of wrong types', fakeAsync(() => {
        // arrange
        let tested = false;
        error = {} as HttpErrorResponse;

        // act
        service.intercept(httpRequest, httpHander).subscribe(() => {
          // should not end up here
          expect(true).toBeFalsy();
        }, () => {
          // should not redirect text
          tested = true;
          expect(router.navigate).not.toHaveBeenCalled();

        });
        tick();

        expect(tested).toBeTruthy();
      }));
    });
  });
});
