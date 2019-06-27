import { ReferenceApiModule } from './reference-api.module';

describe('ReferenceApiModule', () => {
  let referenceApiModule: ReferenceApiModule;

  beforeEach(() => {
    referenceApiModule = new ReferenceApiModule();
  });

  it('should create an instance', () => {
    expect(referenceApiModule).toBeTruthy();
  });
});
