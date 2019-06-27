import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, Subscriber } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/internal/operators/map';
import { ScopeHelper } from 'src/app/scopes.enum';

export const HttpHeaderSkipRefresh = 'X-Skip-TokenRefresh';
export const HttpHeaderSkipInterceptor = 'X-Skip-Interceptor';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
  id_token: string;
}

interface JwtToken {
  upn: string;
  sub: string;
  given_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CookieManagementService {
  private _authTokenCookieName = 'auth_token';
  private _hgIdCookieName = 'hg_id';
  private _authFriendlyNameCookieName = 'given_name';
  private _authUserNameCookieName = 'user_name';
  private _refreshTokenCookieName = 'refresh_token';
  private _tokenExpiryCookieName = 'token_expiry';
  private _authScopeCookieName = 'scope';


  public get userName(): string {
    return this.cookieService.get(this._authUserNameCookieName);
  }

  private set _userName(value: string) {
    this.cookieService.set(this._authUserNameCookieName, value, null, '/');
  }

  public get hgId(): string {
    return this.cookieService.get(this._hgIdCookieName);
  }

  private set _hgId(value: string) {
    this.cookieService.set(this._hgIdCookieName, value, null, '/');
  }

  public get token(): string {
    return this.cookieService.get(this._authTokenCookieName);
  }

  private set _token(value: string) {
    this.cookieService.set(this._authTokenCookieName, value, null, '/');
  }

  private _tokenExpiryChangeSubscriber: Subscriber<void>;
  private _tokenExpiryChangeObserver = new Observable<void>((subscriber) => {
    this._tokenExpiryChangeSubscriber = subscriber;
  });
  public get tokenChangeObserver(): Observable<void> {
    return this._tokenExpiryChangeObserver;
  }

  private get refreshToken(): string {
    return this.cookieService.get(this._refreshTokenCookieName);
  }

  private set refreshToken(value: string) {
    this.cookieService.set(this._refreshTokenCookieName, value, null, '/');
  }

  public get scope(): string {
    return this.cookieService.get(this._authScopeCookieName);
  }

  private set _scope(value: string) {
    this.cookieService.set(this._authScopeCookieName, value, null, '/');
  }

  public get userFullName(): string {
    return this.cookieService.get(this._authFriendlyNameCookieName);
  }

  private set _userFullName(value: string) {
    this.cookieService.set(this._authFriendlyNameCookieName, value, null, '/');
  }

  public get tokenExpiryTime(): number {
    const expiryTimeString = this.cookieService.get(this._tokenExpiryCookieName);
    const expiryDate = Date.parse(expiryTimeString);
    return expiryDate;
  }

  private set _tokenExpiryTime(value: number) {
    const expiryTime = new Date(Date.now());
    expiryTime.setSeconds(expiryTime.getSeconds() + value);
    this.cookieService.set(this._tokenExpiryCookieName, expiryTime.toString(), null, '/');
    if (this._tokenExpiryChangeSubscriber != null) { this._tokenExpiryChangeSubscriber.next(); }
  }

  constructor(
    private cookieService: CookieService,
    private jwtHelperService: JwtHelperService,
    private http: HttpClient,
  ) {

  }

  private saveAuthInCookie(response: AuthResponse) {
    this._token = response.access_token;
    this.refreshToken = response.refresh_token;
    this._scope = response.scope;
    this._tokenExpiryTime = response['expires_in'];
  }

  public clearCookie() {
    this.cookieService.delete(this._authTokenCookieName);
    this.cookieService.delete(this._authFriendlyNameCookieName);
    this.cookieService.delete(this._authUserNameCookieName);
    this.cookieService.delete(this._hgIdCookieName);
    this.cookieService.delete(this._refreshTokenCookieName);
    this.cookieService.delete(this._authScopeCookieName);
    this.cookieService.delete(this._tokenExpiryCookieName);
  }

  public saveJwtTokenInCookie(response: AuthResponse) {
    const token = this.decodeJwtToken(response.id_token);
    this._hgId = token.upn == null ? token.sub : token.upn;
    this._userFullName = token.given_name == null ? token.sub : token.given_name;
  }

  public getAuthToken(username: string, password: string): Observable<boolean> {
    this.clearCookie();

    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + environment.authToken,
    });
    headers = headers.append(HttpHeaderSkipInterceptor, '');

    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    body.set('grant_type', 'password');

    body.set('scope', ScopeHelper.allScopes.join(' '));

    const options = {
      headers: headers
    };
    const authObj = this.http.post(environment.apiUrl + '/token', body.toString(), options);

    return authObj.pipe(
      map((response: AuthResponse) => {
        this.saveAuthInCookie(response);
        this._userName = username;
        this.saveJwtTokenInCookie(response);
        return true;
      }));
  }

  public revokeToken(): Observable<void> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + environment.authToken,
    });
    headers = headers.append(HttpHeaderSkipInterceptor, '');

    const body = new URLSearchParams();
    body.set('token', this.refreshToken);

    const options = {
      headers: headers
    };
    return this.http.post(environment.apiUrl + '/revoke', body.toString(), options).pipe(
      map(() => {
        body.set('token', this.token);
        this.http.post(environment.apiUrl + '/revoke', body.toString(), options);
      })
    );
  }

  public refreshAuthToken(force = false): Observable<boolean> {
    // make sure the token is expired before refreshing
    const expiryDate = this.tokenExpiryTime;
    if (!force && expiryDate > Date.now()) {
      return new Observable((observer) => {
        observer.next(true);
        observer.complete();
      });
    }

    const refreshToken = this.refreshToken;
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + environment.authToken,
    });
    headers = headers.append(HttpHeaderSkipInterceptor, '');

    const body = new URLSearchParams();
    body.set('refresh_token', refreshToken);
    body.set('grant_type', 'refresh_token');
    body.set('scope', this.scope);

    const options = {
      headers: headers
    };
    const authObj = this.http.post(environment.apiUrl + '/token', body.toString(), options);

    return authObj.pipe(map((response: AuthResponse) => {
      this.saveAuthInCookie(response);
      return true;
    }));
  }

  private decodeJwtToken(token: string): JwtToken {
    return this.jwtHelperService.decodeToken(token);
  }
}
