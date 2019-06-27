import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { Location } from '@angular/common';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, Subscriber } from 'rxjs';
import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({ template: '' })
export class StubComponent {

}

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let location: Location;

    const routes: Routes = [{
        path: 'admin',
        component: StubComponent,
        children: [
            {
                path: 'dashboard',
                component: StubComponent
            },
            {
                path: 'transactional-banking/:userId/profile',
                component: StubComponent
            }]
    }];

    beforeEach(async(() => {
        class AuthServiceMock {
            login() { }
            get loggedInAgentId() { return ''; }
        }

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                RouterTestingModule.withRoutes(routes)
            ],
            declarations: [
                StubComponent,
                LoginComponent
            ],
            providers: [
                { provide: AuthService, useClass: AuthServiceMock },
                HttpClient,
                HttpHandler,
                Location
            ],
        })
            .compileComponents();

        location = TestBed.get(Location);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });


    describe('login', () => {
        let authService: AuthService;
        let observer: Subscriber<boolean>;
        beforeEach(inject([AuthService], (_authService: AuthService, _location: Location) => {
            authService = _authService;

            const observable = new Observable<boolean>((o) => {
                observer = o;
            });
            component.credentials.username = 'testUsername';
            component.credentials.password = 'testPassword';

            spyOn(authService, 'login').and.returnValue(observable);
        }));

        it('Should call auth service login method', () => {
            // arrange

            // act
            component.login();

            // assert
            expect(authService.login).toHaveBeenCalledWith('testUsername', 'testPassword');
        });

        it('Should navigate to dashboard when auth success', fakeAsync(() => {
            // arrange
            expect(component.loading).toBeFalsy();

            // act
            component.login();
            expect(component.loading).toBeTruthy();
            observer.next(true);

            // assert
            tick();
            expect(location.path()).toBe('/admin/dashboard');
            expect(component.loading).toBeFalsy();
        }));

        it('Should set loading state', fakeAsync(() => {
            // before
            expect(component.loading).toBeFalsy();

            // during
            component.login();
            expect(component.loading).toBeTruthy();
            observer.next(true);

            // after
            tick();
            expect(component.loading).toBeFalsy();
        }));

        it('Should set loading after invalid login', fakeAsync(() => {
            // before
            expect(component.loading).toBeFalsy();

            // during
            component.login();
            expect(component.loading).toBeTruthy();
            observer.next(false);

            // after
            tick();
            expect(component.loading).toBeFalsy();
        }));

        it('Should set loading after exception', fakeAsync(() => {
            // before
            expect(component.loading).toBeFalsy();

            // during
            component.login();
            expect(component.loading).toBeTruthy();
            observer.error(null);

            // after
            tick();
            expect(component.loading).toBeFalsy();
        }));

        it('Should set the error message when the auth result if false', () => {
            component.login();
            observer.next(false);

            // assert
            expect(component.error).toBe('Username or password is incorrect');
        });

        it('Should set the error message when auth request fails', () => {
            component.login();
            observer.error({ error: { error_description: 'test error' } });

            // assert
            expect(component.error).toBe('test error');
        });

        it('Should set generic error when the error object is not defined', () => {
            component.login();
            observer.error(null);

            // assert
            expect(component.error).toBe('You could not be logged in at this time. Please try again or contact your system administrator');
        });

        it('Should set generic error when the error object is not as expected', () => {
            component.login();
            observer.error({});

            // assert
            expect(component.error).toBe('You could not be logged in at this time. Please try again or contact your system administrator');
        });

        it('Should set generic error when the description is not set', () => {
            component.login();
            observer.error({ error: {} });

            // assert
            expect(component.error).toBe('You could not be logged in at this time. Please try again or contact your system administrator');
        });
    });
});
