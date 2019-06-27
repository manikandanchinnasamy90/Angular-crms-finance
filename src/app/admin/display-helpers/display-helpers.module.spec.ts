import { DisplayHelpersModule } from './display-helpers.module';

describe('DisplayHelpersModule', () => {
  let displayHelpersModule: DisplayHelpersModule;

  beforeEach(() => {
    displayHelpersModule = new DisplayHelpersModule();
  });

  it('should create an instance', () => {
    expect(displayHelpersModule).toBeTruthy();
  });
});
