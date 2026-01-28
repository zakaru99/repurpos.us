import { InternalModule } from './internal.module';

describe('InternalModule', () => {
  let internalModule: InternalModule;

  beforeEach(() => {
    internalModule = new InternalModule();
  });

  it('should create an instance', () => {
    expect(internalModule).toBeTruthy();
  });
});
