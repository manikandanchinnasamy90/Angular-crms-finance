import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ParamMap } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * @description Makes it easier to read route parameters for the current route
 */
@Injectable({
  providedIn: 'root'
})
export class RouteParametersService {
  private _parameters: ParamMap;
  private _observer = new BehaviorSubject<void>(null);

  /**
   * @description Create a observable to subscribe to for route changes
   */
  public changes: Observable<void> = this._observer.asObservable();

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    // subscribe to route changes
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(a => this.getLastFirstChild(a)),
      switchMap(route => route.paramMap)
    )
      .subscribe((p) => this.handleParamChange(p));
  }

  /**
   * @description Helper method to get last first child
   * @param activatedRoute Activated route
   */
  private getLastFirstChild(activatedRoute: ActivatedRoute): ActivatedRoute {
    let route = activatedRoute.firstChild;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  /**
   * @description Helper method to respond to changes in the route
   * @param paramMap Param map returned from route
   */
  private handleParamChange(paramMap: ParamMap) {
    this._parameters = paramMap;
    this._observer.next(null);
  }

  /**
   * @description Get route parameter from the current route
   * @param parameter The parameter to get
   */
  public getRouteParameter(parameter: string): string | null {
    if (this._parameters != null && this._parameters.has(parameter)) {
      return this._parameters.get(parameter);
    }

    return null;
  }

  /**
   * @description Get route parameter from the current route and parse it to a number
   * @param parameter The parameter to get
   */
  public getRouteNumberParameter(parameter: string): number | null {

    const routerParam = this.getRouteParameter(parameter);
    if (routerParam == null) {
      return null;
    }
    const numberParam = Number(routerParam);
    if (Number.isNaN(numberParam)) {
      return null;
    }

    return numberParam;
  }

}
