declare function require(moduleName: string): any;
const { version: appVersion } = require('../../package.json');

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthenticationInterceptor } from './admin/_interceptors/authentication.interceptor';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    NgbModule,
    BrowserModule,
    LoginModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    CookieService,
    NgbActiveModal,
    AuthGuard,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    {
      provide: JwtHelperService,
      useValue: new JwtHelperService()
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(authService: AuthService) {
    authService.checkRefreshToken();
    // tslint:disable-next-line:no-console
    console.info(`Application Version: ${appVersion}`);
  }
}
