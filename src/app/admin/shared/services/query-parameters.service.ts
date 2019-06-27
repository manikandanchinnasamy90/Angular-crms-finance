import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ParamMap } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';

/**
 * @description Makes it easier to read query parameters for the current route
 */
@Injectable({
  providedIn: 'root'
})
export class QueryParametersService {
  private _parameters: ParamMap;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    // subscribe to route changes
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(a => this.getLastFirstChild(a)),
      switchMap(route => route.queryParamMap)
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
  }

  /**
   * @description Get query parameter from the current route
   * @param parameter The parameter to get
   */
  public getQueryParameter(parameter: string): string | null {
    if (this._parameters != null && this._parameters.has(parameter)) {
      return this._parameters.get(parameter);
    }

    return null;
  }

  /**
   * @description Gets the current search page from the route used while searching for elements
   */
  public get currentSearchPage(): number {
    return this.getQueryParameter('pageNumber') == null ?
      0 :
      parseInt(this.getQueryParameter('pageNumber'), 10);
  }
}
