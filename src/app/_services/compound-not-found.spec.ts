import { CompoundService } from './compound.service';

// A compound missing from the index must not show "didn't load, try again"
describe('CompoundService.isNotFound', () => {
  it('treats the backend\'s NotFoundError 500 and a plain 404 as not found', () => {
    expect(CompoundService.isNotFound({ status: 500, error: { status: 'fail',
      error: 'NotFoundError(404, \'{"_index":"reframe","found":false}\')' } })).toBe(true);
    expect(CompoundService.isNotFound({ status: 404, error: null })).toBe(true);
  });

  it('treats other errors as failures', () => {
    expect(CompoundService.isNotFound({ status: 500, error: { status: 'fail', error: 'ConnectionError' } })).toBe(false);
    expect(CompoundService.isNotFound({ status: 0, error: {} })).toBe(false);
    expect(CompoundService.isNotFound({ status: 502, error: '<html>Bad Gateway</html>' })).toBe(false);
  });
});
