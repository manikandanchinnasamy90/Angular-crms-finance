import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
    preloadedModules: string[] = [];

    preload(route: Route, load: () => Observable<any>): Observable<any> {
        console.log('r', route);
        if (route.data && route.data['preload']) {
            // add the route path to the preloaded module array
            this.preloadedModules.push(route.path);
            return load();
        } else {
            return of(null);
        }
    }
}
