import { DisplayDecoratorsModule } from './display-decorators.module';

describe('DisplayDecoratorsModule', () => {
  let displayDecoratorsModule: DisplayDecoratorsModule;

  beforeEach(() => {
    displayDecoratorsModule = new DisplayDecoratorsModule();
  });

  it('should create an instance', () => {
    expect(displayDecoratorsModule).toBeTruthy();
  });
});
