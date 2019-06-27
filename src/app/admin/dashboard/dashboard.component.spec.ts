import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'src/app/auth.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { HideRouteWithScopeDirective } from '../shared/shared.module';
import { JwtHelperService } from '@auth0/angular-jwt';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HideRouteWithScopeDirective,
        DashboardComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        AuthService,
        HttpClient,
        HttpHandler,
        CookieService,
        {
          provide: JwtHelperService,
          useValue: new JwtHelperService()
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
