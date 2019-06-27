import { Injectable } from '@angular/core';
import { map } from 'lodash';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpHeaderSkipInterceptor, HttpHeaderSkipRefresh } from 'src/app/cookie-management.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService, private router: Router) { }

  /**
   * @description Intercept all HTTP requests and adds Authorization token.
   */
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const errorHandler = (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }

        // login failed with bad request it's probably the refresh token that failed
        if (err.status === 400 && err.url === environment.apiUrl + '/token') {
          this.router.navigate(['/login']);
        }
      }
    };
    if (req.headers.has(HttpHeaderSkipInterceptor) || !this.authenticationService.isLoggedIn) {
      req = this.setHeader(req, false);
      return next.handle(req).pipe(tap(() => { }, errorHandler));
    } else {
      if (req.headers.has(HttpHeaderSkipRefresh)) {
        req = this.setHeader(req);
        return next.handle(req).pipe(tap(() => { }, errorHandler));
      } else {
        // refresh token
        return this.authenticationService.refreshToken().pipe(switchMap(r => {
          req = this.setHeader(req);
          return next.handle(req).pipe(tap(() => { }, errorHandler));
        }));
      }
    }
  }

  private setHeader(req: HttpRequest<any>, addAuthHeader: boolean = true): HttpRequest<any> {

    let headerObject: HttpHeaders = new HttpHeaders();

    // map existing headers into new object without skip headers
    map(req.headers.keys(), (k) => {
      if (k !== HttpHeaderSkipInterceptor && k !== HttpHeaderSkipRefresh) {
        headerObject = headerObject.append(k, req.headers.get(k));
      }
    });

    // add auth header
    if (addAuthHeader) {
      headerObject = headerObject.append('Authorization', `Bearer ${this.authenticationService.token}`);
    }

    return req.clone({
      headers: headerObject,
    });
  }
}
