import { canReview, hasPortal, roleOf } from './login-state';

describe('roleOf', () => {
  it('uses role when the backend sends it', () => {
    expect(roleOf({ admin: false, role: 'reviewer' })).toBe('reviewer');
    expect(roleOf({ admin: false, role: 'readonly' })).toBe('readonly');
    expect(roleOf({ admin: true, role: 'admin' })).toBe('admin');
    expect(roleOf({ admin: false, role: 'user' })).toBe('user');
  });

  it('falls back to admin from a backend without roles', () => {
    expect(roleOf({ admin: true })).toBe('admin');
    expect(roleOf({ admin: false })).toBe('user');
  });

  it('ignores an unknown role', () => {
    expect(roleOf({ admin: false, role: 'superuser' })).toBe('user');
  });
});

describe('canReview', () => {
  it('is true for admins and reviewers only', () => {
    expect(canReview('admin')).toBe(true);
    expect(canReview('reviewer')).toBe(true);
    expect(canReview('readonly')).toBe(false);
    expect(canReview('user')).toBe(false);
  });
});

describe('hasPortal', () => {
  it('is true for every staff role', () => {
    expect(hasPortal('admin')).toBe(true);
    expect(hasPortal('reviewer')).toBe(true);
    expect(hasPortal('readonly')).toBe(true);
    expect(hasPortal('user')).toBe(false);
  });
});
