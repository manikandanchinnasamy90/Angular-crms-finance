/* istanbul ignore file */
import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild,
    CanLoad, Route
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private authService: AuthService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const url: string = state.url;
        const isLoggedIn = this.checkLogin(url);
        if (!isLoggedIn) {
            return false;
        }

        const routeData = route.routeConfig.data;
        if (routeData == null || routeData.scope == null) {
            return true;
        }

        // check scope
        if (routeData.scope instanceof Array) {
            return (routeData.scope as Array<any>)
                .reduce((previous, scope) => previous && this.authService.hasScope(scope));
        }

        return this.authService.hasScope(routeData.scope);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    canLoad(route: Route): boolean {
        const url = `/${route.path}`;
        return this.checkLogin(url);
    }

    checkLogin(url: string): boolean {
        if (this.authService.isLoggedIn) {
            return true;
        } else {
            console.log('IS NO Longer Logged In');
        }

        // Navigate to the login page with extras
        this.router.navigate(['/login']);
        return false;
    }
}
