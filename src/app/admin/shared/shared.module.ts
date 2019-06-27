import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideRouteWithScopeDirective } from './directives/hide-route-with-scope.directive';

/**
 * @description Services shared across multiple modules
 */
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    HideRouteWithScopeDirective
  ],
  declarations: [
    HideRouteWithScopeDirective
  ]
})
export class SharedModule { }

export * from './services/service-exports';
export * from './directives/hide-route-with-scope.directive';
