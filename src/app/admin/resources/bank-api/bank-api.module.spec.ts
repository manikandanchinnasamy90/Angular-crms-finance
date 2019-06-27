import { BankApiModule } from './bank-api.module';
import { Injector } from '@angular/core';
import { InjectorFactory } from './decorators/injector-factory';

describe('BankApiModule', () => {
  let bankApiModule: BankApiModule;
  const injector: Injector = {} as Injector;
  beforeEach(() => {

    bankApiModule = new BankApiModule(injector);
  });

  it('should create an instance', () => {
    expect(bankApiModule).toBeTruthy();
  });

  it('should set InjectorInstance', () => {
    expect(InjectorFactory.InjectorInstance).toBe(injector);
  });
});
