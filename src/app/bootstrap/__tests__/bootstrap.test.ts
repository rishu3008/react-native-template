import { bootstrap, teardownBootstrap } from '@app/bootstrap';
import { apiClient } from '@services';

describe('bootstrap', () => {
  afterEach(() => {
    teardownBootstrap();
    jest.restoreAllMocks();
  });

  it('installs interceptors once', () => {
    const addRequest = jest.spyOn(apiClient, 'addRequestInterceptor');

    bootstrap();
    bootstrap();
    bootstrap();

    // Strict mode mounts twice in development; a second call must not stack
    // a duplicate set of interceptors.
    expect(addRequest).toHaveBeenCalledTimes(1);
  });

  it('can be torn down and started again', () => {
    const addRequest = jest.spyOn(apiClient, 'addRequestInterceptor');

    bootstrap();
    teardownBootstrap();
    bootstrap();

    expect(addRequest).toHaveBeenCalledTimes(2);
  });
});
