import { UserPortalModule } from './user-portal.module';

describe('UserPortalModule', () => {
  let userPortalModule: UserPortalModule;

  beforeEach(() => {
    userPortalModule = new UserPortalModule();
  });

  it('should create an instance', () => {
    expect(userPortalModule).toBeTruthy();
  });
});
