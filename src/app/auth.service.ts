import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Scopes } from './scopes.enum';
import { includes } from 'lodash';
import { CookieManagementService } from './cookie-management.service';
import { LogoutModalComponent } from './login/logout-modal/logout-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthService {

  private _refreshTokenTimer: NodeJS.Timer;

  constructor(
    public router: Router,
    private cookieService: CookieManagementService,
    private modalService: NgbModal
  ) {
    this.cookieService.tokenChangeObserver.subscribe(() => {
      this.checkRefreshToken();
    });
  }

  public checkRefreshToken() {
    this.setRefreshTokenTimeout();
  }

  public get isLoggedIn(): boolean {
    const token = this.cookieService.token;
    return token != null && token.trim() !== '';
  }

  public refreshToken(): Observable<boolean> {
    return this.cookieService.refreshAuthToken();
  }

  public get loggedInUsername(): string {
    const username: string = this.cookieService.userFullName;
    if (username == null) {
      return 'UNKNOWN';
    }
    return username;
  }

  public get loggedInAgentId(): string {
    return this.cookieService.hgId;
  }

  public get token(): string {
    return this.cookieService.token;
  }

  public login(username: string, password: string): Observable<boolean> {

    return this.cookieService.getAuthToken(username, password);
  }

  public logout(): void {
    this.cookieService.revokeToken().subscribe(() => {
      this.cookieService.clearCookie();
    });
    this.router.navigate(['/login']);
  }

  public hasScope(scope: Scopes): boolean {
    const currentScopes = this.cookieService.scope;
    if (currentScopes == null) {
      return false;
    }

    const allScopes = currentScopes.split(' ');
    return includes(allScopes, scope);
  }

  private setRefreshTokenTimeout() {
    if (this._refreshTokenTimer != null) {
      clearTimeout(this._refreshTokenTimer);
    }

    const expiryDate = this.cookieService.tokenExpiryTime;
    if (Number.isNaN(expiryDate)) {
      return;
    }
    const refreshExpiry = expiryDate + 60000 * environment.refreshTokenExpiry; // five minutes after
    const timeToExpiry = refreshExpiry - Date.now();

    if (timeToExpiry <= 0) {
      this.logout();
      return;
    }

    this._refreshTokenTimer = setTimeout(() => {
      // show modal
      this.modalService.open(LogoutModalComponent);
      this._refreshTokenTimer = null;
    }, timeToExpiry - 60000);
  }
}
