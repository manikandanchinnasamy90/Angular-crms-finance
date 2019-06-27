import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectorFactory } from './decorators/injector-factory';

/**
 * @description All services and models related to the bank API model
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
})
export class BankApiModule {

  /**
   * Constructor. Sets the injector in a global static property that can be accessed by decorator static functions
   * @param injector Dependency injected service
   */
  constructor(private injector: Injector) {
    InjectorFactory.InjectorInstance = this.injector;
  }
}

export * from './models/model-exports';
export * from './services/service-exports';
