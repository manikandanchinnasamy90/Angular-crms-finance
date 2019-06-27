import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscriber, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Scopes, ScopeHelper } from './scopes.enum';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieManagementService } from './cookie-management.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('AuthService', () => {

    beforeEach(() => {
        const cookieServiceStub = jasmine.createSpyObj(['get', 'set', 'delete']);
        const httpMock = jasmine.createSpyObj('HttpClient', ['post', 'get']);
        const routerMock = jasmine.createSpyObj(['navigate']);
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                CookieManagementService,
                {
                    provide: CookieService,
                    useValue: cookieServiceStub
                },
                {
                    provide: HttpClient,
                    useValue: httpMock
                },
                {
                    provide: Router,
                    useValue: routerMock
                },
                {
                    provide: NgbModal,
                    useValue: jasmine.createSpyObj(['open'])
                },
                {
                    provide: JwtHelperService,
                    useValue: new JwtHelperService()
                },
            ]
        });
    });

    it('should be created', inject([AuthService], (service: AuthService) => {
        expect(service).toBeTruthy();
    }));

    describe('isLoggedIn', () => {
        it('should check token from cookie service', inject(
            [AuthService, CookieService],
            (service: AuthService, cookieService: CookieService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue('test');

                // act
                const result = service.isLoggedIn;

                // assert
                expect(result).toBeTruthy();
                expect(cookieService.get).toHaveBeenCalledWith('auth_token');
            }));

        it('should check token null from cookie service', inject(
            [AuthService, CookieService],
            (service: AuthService, cookieService: CookieService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue(null);

                // act
                const result = service.isLoggedIn;

                // assert
                expect(result).toBeFalsy();
                expect(cookieService.get).toHaveBeenCalledWith('auth_token');
            }));

        it('should check token empty from cookie service', inject(
            [AuthService, CookieService],
            (service: AuthService, cookieService: CookieService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue(' ');

                // act
                const result = service.isLoggedIn;

                // assert
                expect(result).toBeFalsy();
                expect(cookieService.get).toHaveBeenCalledWith('auth_token');
            }));
    });

    describe('refreshToken', () => {
        it('should call http service', inject(
            [AuthService, CookieService, HttpClient],
            (service: AuthService, cookieService: CookieService, httpClient: HttpClient) => {
                // arrange
                let observer: Subscriber<{}>;
                let headers: HttpHeaders;
                (httpClient.post as jasmine.Spy).and.callFake((url, body, options) => {
                    headers = options.headers;
                    return new Observable((o) => { observer = o; });
                });

                (cookieService.get as jasmine.Spy).and.callFake((val) => {
                    if (val === 'token_expiry') {
                        return (new Date('2018-01-01 12:00')).toString();
                    }
                    return val;
                });

                // act
                service.refreshToken().subscribe((result) => {
                    // assert cookie
                    expect(result).toBeTruthy();
                    expect(cookieService.set).toHaveBeenCalledWith('auth_token', 'access_token', null, '/');
                    expect(cookieService.set).toHaveBeenCalledWith('refresh_token', 'refresh_token', null, '/');
                    expect(cookieService.set).toHaveBeenCalledWith('scope', 'scope', null, '/');
                });

                // assert
                expect(httpClient.post).toHaveBeenCalledWith(
                    environment.apiUrl + '/token',
                    'refresh_token=refresh_token&grant_type=refresh_token&scope=scope',
                    jasmine.any(Object));

                expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
                expect(headers.get('Authorization')).toBe('Basic ' + environment.authToken);
                expect(headers.get('X-Skip-Interceptor')).toBe('');

                observer.next({
                    access_token: 'access_token',
                    refresh_token: 'refresh_token',
                    scope: 'scope',
                    expires_in: 100
                });
            }));
        it('should not call when token is not expired', inject(
            [AuthService, CookieService, HttpClient],
            (service: AuthService, cookieService: CookieService, httpClient: HttpClient) => {
                (cookieService.get as jasmine.Spy).and.callFake((val) => {
                    if (val === 'token_expiry') {
                        return (new Date('2018-01-01 12:01')).toString();
                    }

                    return val;
                });

                spyOn(Date, 'now').and.returnValue(new Date('2018-01-01 12:00'));

                // act
                let tested = false;
                service.refreshToken().subscribe((result) => {
                    tested = true;
                    expect(result).toBeTruthy();
                    expect(httpClient.post).not.toHaveBeenCalled();
                });

                expect(tested).toBeTruthy();
            }));

        it('should allow forcing refresh', inject(
            [CookieService, HttpClient, CookieManagementService],
            (cookieService: CookieService, httpClient: HttpClient, cookieManService: CookieManagementService) => {
                (cookieService.get as jasmine.Spy).and.callFake((val) => {
                    if (val === 'token_expiry') {
                        return (new Date('2018-01-01 12:01')).toString();
                    }

                    return val;
                });

                (httpClient.post as jasmine.Spy).and.callFake(() => {

                    return new Observable((o) => { });
                });

                spyOn(Date, 'now').and.returnValue(new Date('2018-01-01 12:00'));

                // act
                cookieManService.refreshAuthToken(true);
                expect(httpClient.post).toHaveBeenCalled();
            }));
    });

    describe('loggedInUsername', () => {
        it('should return username from cookie', inject(
            [AuthService, CookieService],
            (service: AuthService, cookieService: CookieService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue('test');

                // act
                const result = service.loggedInUsername;

                // assert
                expect(result).toBe('test');
                expect(cookieService.get).toHaveBeenCalledWith('given_name');
            }));

        it('should check for null username', inject(
            [AuthService, CookieService],
            (service: AuthService, cookieService: CookieService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue(null);

                // act
                const result = service.loggedInUsername;

                // assert
                expect(result).toBe('UNKNOWN');
            }));
    });

    describe('loggedInAgentId', () => {
        it('should return username from cookie', inject(
            [AuthService, CookieService],
            (service: AuthService, cookieService: CookieService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue('test');

                // act
                const result = service.loggedInAgentId;

                // assert
                expect(result).toBe('test');
                expect(cookieService.get).toHaveBeenCalledWith('hg_id');
            }));
    });

    describe('token', () => {
        it('should return token from cookie', inject(
            [AuthService, CookieService],
            (service: AuthService, cookieService: CookieService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue('test');

                // act
                const result = service.token;

                // assert
                expect(result).toBe('test');
                expect(cookieService.get).toHaveBeenCalledWith('auth_token');
            }));
    });

    describe('login', () => {
        let service: AuthService;
        let cookieService: CookieService;
        let httpClient: HttpClient;
        let postTokenObserver: Subscriber<{}>;
        let postTokenOptions: { headers: HttpHeaders };
        let jwtHelperService: JwtHelperService;

        beforeEach(inject(
            [AuthService, CookieService, HttpClient, JwtHelperService],
            (_service: AuthService, _cookieService: CookieService, _httpClient: HttpClient, _jwtHelperService: JwtHelperService) => {
                service = _service;
                cookieService = _cookieService;
                httpClient = _httpClient;
                jwtHelperService = _jwtHelperService;


                (httpClient.post as jasmine.Spy).and.callFake((_url, _body, options) => {
                    postTokenOptions = options;
                    return new Observable((o) => { postTokenObserver = o; });
                });

                spyOn(jwtHelperService, 'decodeToken').and.returnValue({ sub: 'hgID', given_name: 'given name' });
            }));

        it('should call http token service', fakeAsync(() => {
            // arrange
            const date = new Date(Date.parse('2018-01-01 12:00:00'));
            spyOn(Date, 'now').and.returnValue(date);

            let tested = false;
            // act
            service.login('username123', 'password123').subscribe((result) => {
                // assert cookie
                expect(result).toBeTruthy();
                date.setSeconds(date.getSeconds() + 100);

                expect(cookieService.set).toHaveBeenCalledWith('auth_token', 'access_token', null, '/');
                expect(cookieService.set).toHaveBeenCalledWith('refresh_token', 'refresh_token', null, '/');
                expect(cookieService.set).toHaveBeenCalledWith('scope', 'scope', null, '/');
                expect(cookieService.set).toHaveBeenCalledWith('user_name', 'username123', null, '/');
                expect(cookieService.set).toHaveBeenCalledWith('hg_id', 'hgID', null, '/');
                expect(cookieService.set).toHaveBeenCalledWith('token_expiry', date.toString(), null, '/');
                expect(cookieService.set).toHaveBeenCalledWith('given_name', 'given name', null, '/');
                tested = true;

                expect(jwtHelperService.decodeToken).toHaveBeenCalledWith('jwt-token');
            });

            const scopeString = ScopeHelper.allScopes.join('+');

            // assert
            expect(httpClient.post).toHaveBeenCalledWith(
                environment.apiUrl + '/token',
                'username=username123&password=password123&grant_type=password&'
                + 'scope=' + scopeString,
                jasmine.any(Object));

            expect(postTokenOptions.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
            expect(postTokenOptions.headers.get('Authorization')).toBe('Basic ' + environment.authToken);
            expect(postTokenOptions.headers.get('X-Skip-Interceptor')).toBe('');

            expect(cookieService.delete).toHaveBeenCalledWith('auth_token');
            expect(cookieService.delete).toHaveBeenCalledWith('hg_id');
            expect(cookieService.delete).toHaveBeenCalledWith('user_name');
            expect(cookieService.delete).toHaveBeenCalledWith('refresh_token');
            expect(cookieService.delete).toHaveBeenCalledWith('scope');
            expect(cookieService.delete).toHaveBeenCalledWith('token_expiry');

            postTokenObserver.next({
                access_token: 'access_token',
                refresh_token: 'refresh_token',
                scope: 'scope',
                id_token: 'jwt-token',
                expires_in: 100
            });

            tick();

            expect(httpClient.get).not.toHaveBeenCalled();
            expect(tested).toBeTruthy('Did not test all asserts in callback');
        }));

        it('should handle no given name', fakeAsync(() => {
            // arrange
            (jwtHelperService.decodeToken as jasmine.Spy).and.returnValue({ sub: 'hgID' });

            // act
            const date = new Date(Date.parse('2018-01-01 12:00:00'));
            spyOn(Date, 'now').and.returnValue(date);

            let tested = false;
            // act
            service.login('username123', 'password123').subscribe((result) => {
                // assert cookie
                expect(result).toBeTruthy();
                date.setSeconds(date.getSeconds() + 100);
                expect(cookieService.set).toHaveBeenCalledWith('given_name', 'hgID', null, '/');
                tested = true;
            });

            postTokenObserver.next({
                access_token: 'access_token',
                refresh_token: 'refresh_token',
                scope: 'scope',
                id_token: 'jwt-token',
                expires_in: 100
            });
            tick();

            // assert
            expect(tested).toBeTruthy('Did not test all asserts in callback');
        }));

        it('should handle no sub', fakeAsync(() => {
            // arrange
            (jwtHelperService.decodeToken as jasmine.Spy).and.returnValue({ upn: 'upn' });

            // act
            const date = new Date(Date.parse('2018-01-01 12:00:00'));
            spyOn(Date, 'now').and.returnValue(date);

            let tested = false;
            // act
            service.login('username123', 'password123').subscribe((result) => {
                // assert cookie
                expect(result).toBeTruthy();
                date.setSeconds(date.getSeconds() + 100);
                expect(cookieService.set).toHaveBeenCalledWith('hg_id', 'upn', null, '/');
                tested = true;
            });

            postTokenObserver.next({
                access_token: 'access_token',
                refresh_token: 'refresh_token',
                scope: 'scope',
                id_token: 'jwt-token',
                expires_in: 100
            });
            tick();

            // assert
            expect(tested).toBeTruthy('Did not test all asserts in callback');
        }));
    });
    describe('logout', () => {
        it('should remove cookies', inject(
            [AuthService, CookieService, Router, HttpClient],
            (service: AuthService, cookieService: CookieService, router: Router, httpClient: HttpClient) => {
                // arrange
                const urls = [];
                const bodies = [];
                (httpClient.post as jasmine.Spy).and.callFake((url, body, _) => {
                    urls.push(url);
                    bodies.push(body);
                    return new Observable((o) => { o.next(); });
                });
                (cookieService.get as jasmine.Spy).and.returnValues('token1', 'token2');

                // act
                service.logout();

                // assert
                expect(cookieService.delete).toHaveBeenCalledWith('auth_token');
                expect(cookieService.delete).toHaveBeenCalledWith('hg_id');
                expect(cookieService.delete).toHaveBeenCalledWith('user_name');
                expect(cookieService.delete).toHaveBeenCalledWith('given_name');
                expect(cookieService.delete).toHaveBeenCalledWith('refresh_token');
                expect(cookieService.delete).toHaveBeenCalledWith('scope');
                expect(cookieService.delete).toHaveBeenCalledWith('token_expiry');
                expect(router.navigate).toHaveBeenCalledWith(['/login']);

                expect(cookieService.get).toHaveBeenCalledWith('auth_token');
                expect(cookieService.get).toHaveBeenCalledWith('refresh_token');
                expect(bodies[0]).toEqual('token=token1');
                expect(bodies[1]).toEqual('token=token2');
                expect(urls[0]).toEqual(environment.apiUrl + '/revoke');
                expect(urls[1]).toEqual(environment.apiUrl + '/revoke');
            }));
    });

    describe('hasScope', () => {
        it('should return true if scope is in the logged in scopes',
            inject([CookieService, AuthService], (cookieService: CookieService, service: AuthService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue('test1 transactions_corporate_plus_multiple_once_of_payment test3');

                // act
                const result = service.hasScope(Scopes.CorporateMultipleOnceOffPayment);

                // assert
                expect(cookieService.get).toHaveBeenCalledWith('scope');
                expect(result).toBeTruthy();
            }));

        it('should return false if scope is not in the logged in scopes',
            inject([CookieService, AuthService], (cookieService: CookieService, service: AuthService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue('test1 other test3');

                // act
                const result = service.hasScope(Scopes.CorporateMultipleOnceOffPayment);

                // assert
                expect(cookieService.get).toHaveBeenCalledWith('scope');
                expect(result).toBeFalsy();
            }));

        it('should return false if no scopes are saved',
            inject([CookieService, AuthService], (cookieService: CookieService, service: AuthService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue(null);

                // act
                const result = service.hasScope(Scopes.CorporateMultipleOnceOffPayment);

                // assert
                expect(cookieService.get).toHaveBeenCalledWith('scope');
                expect(result).toBeFalsy();
            }));

        it('should return true if empty are saved',
            inject([CookieService, AuthService], (cookieService: CookieService, service: AuthService) => {
                // arrange
                (cookieService.get as jasmine.Spy).and.returnValue('');

                // act
                const result = service.hasScope(Scopes.CorporateMultipleOnceOffPayment);

                // assert
                expect(cookieService.get).toHaveBeenCalledWith('scope');
                expect(result).toBeFalsy();
            }));
    });

    describe('setRefreshTokenTimeout', () => {
        let cookieManagementService: CookieManagementService;
        let cookieService: CookieService;
        let modalService: NgbModal;
        let service: AuthService;
        let router: Router;
        let httpClient: HttpClient;

        beforeEach(inject([AuthService, CookieManagementService, CookieService, NgbModal, Router, HttpClient], (
            _service: AuthService,
            _cookieManagementService: CookieManagementService,
            _cookieService: CookieService,
            gbModal: NgbModal,
            _router: Router,
            _httpClient: HttpClient,
        ) => {
            modalService = gbModal;
            cookieManagementService = _cookieManagementService;
            service = _service;
            cookieService = _cookieService;
            router = _router;
            httpClient = _httpClient;

            (httpClient.post as jasmine.Spy).and.callFake(() => {
                return new Observable((o) => { o.next(); });
            });
        }));

        // it('should open the logout modal 3.5 minutes after the token expiry', fakeAsync(() => {
        //     // arrange
        //     spyOn(Date, 'now').and.returnValue(new Date('2018-01-01 10:00'));
        //     (cookieService.get as jasmine.Spy).and.returnValue('Mon Jan 01 2018 10:05:00 GMT+0200 (South Africa Standard Time)');
        //     // act
        //     service['setRefreshTokenTimeout']();
        //     tick();

        //     // assert
        //     expect(modalService.open).not.toHaveBeenCalled();
        //     tick(60000 * 5 + 3.5 * 60000 - 10);
        //     expect(modalService.open).not.toHaveBeenCalled();
        //     tick(10);
        //     expect(modalService.open).toHaveBeenCalled();
        // }));

        // it('should not have two active timers', fakeAsync(() => {
        //     // arrange
        //     spyOn(Date, 'now').and.returnValue(new Date('2018-01-01 10:00'));
        //     (cookieService.get as jasmine.Spy).and.returnValue('Mon Jan 01 2018 10:05:00 GMT+0200 (South Africa Standard Time)');
        //     // act
        //     service['setRefreshTokenTimeout']();
        //     tick();
        //     service['setRefreshTokenTimeout']();
        //     tick();

        //     // assert
        //     expect(modalService.open).not.toHaveBeenCalled();
        //     tick(60000 * 5 + 3.5 * 60000 - 10);
        //     expect(modalService.open).not.toHaveBeenCalled();
        //     tick(10);
        //     expect(modalService.open).toHaveBeenCalledTimes(1);
        // }));

        it('should handler invalid cookie', fakeAsync(() => {
            // arrange
            spyOn(Date, 'now').and.returnValue(new Date('2018-01-01 10:00'));
            (cookieService.get as jasmine.Spy).and.returnValue('Not a time');
            // act
            service['setRefreshTokenTimeout']();

            // assert
            tick();
            expect(modalService.open).not.toHaveBeenCalled();
        }));

        it('should handler already expired cookie', fakeAsync(() => {
            // arrange
            spyOn(Date, 'now').and.returnValue(new Date('2018-01-01 10:00'));
            spyOn(cookieManagementService, 'clearCookie');
            (cookieService.get as jasmine.Spy).and.returnValue('Mon Jan 01 2018 09:55:00 GMT+0200 (South Africa Standard Time)');

            // act
            service['setRefreshTokenTimeout']();

            // assert
            tick();
            expect(modalService.open).not.toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
            expect(cookieManagementService.clearCookie).toHaveBeenCalled();
        }));
    });
});
