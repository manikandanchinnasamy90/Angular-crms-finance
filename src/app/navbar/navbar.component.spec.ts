import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../auth.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';

describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavbarComponent],
            imports: [RouterTestingModule, HttpClientModule],
            providers: [
                AuthService,
                CookieService,
                {
                    provide: JwtHelperService,
                    useValue: new JwtHelperService()
                },
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should read the username on init', inject([AuthService], (authService: AuthService) => {
        // arrange
        spyOnProperty(authService, 'loggedInUsername', 'get').and.returnValue('testUsername');

        // act
        component.ngOnInit();

        // assert
        expect(component.username).toBe('testUsername');
    }));
});
