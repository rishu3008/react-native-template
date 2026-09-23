import { analytics, crashReporter, __resetLogger, logger } from '@services';

describe('analytics adapter', () => {
  afterEach(() => {
    analytics.restoreDefault();
  });

  it('routes to the registered adapter', () => {
    const adapter = {
      track: jest.fn(),
      screen: jest.fn(),
      identify: jest.fn(),
      reset: jest.fn(),
    };
    analytics.configure(adapter);

    analytics.track({ name: 'signed_in', properties: { method: 'email' } });
    analytics.screen('Home');
    analytics.identify('user-1');
    analytics.reset();

    expect(adapter.track).toHaveBeenCalledWith({
      name: 'signed_in',
      properties: { method: 'email' },
    });
    expect(adapter.screen).toHaveBeenCalledWith('Home', undefined);
    expect(adapter.identify).toHaveBeenCalledWith('user-1', undefined);
    expect(adapter.reset).toHaveBeenCalled();
  });

  it('logs instead of discarding when no vendor is registered', () => {
    __resetLogger('debug');
    const transport = jest.fn();
    logger.addTransport(transport);

    analytics.track({ name: 'no_vendor' });

    // The absence of a vendor must never be silent: event wiring has to be
    // verifiable before an SDK exists.
    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('no_vendor'),
      }),
    );
  });
});

describe('crash reporter adapter', () => {
  afterEach(() => {
    crashReporter.reset();
  });

  it('routes to the registered reporter', () => {
    const reporter = {
      recordError: jest.fn(),
      leaveBreadcrumb: jest.fn(),
      setUser: jest.fn(),
    };
    crashReporter.configure(reporter);

    const error = new Error('boom');
    crashReporter.recordError(error, { screen: 'Home' });
    crashReporter.leaveBreadcrumb('tapped save');
    crashReporter.setUser({ id: 'user-1' });

    expect(reporter.recordError).toHaveBeenCalledWith(error, {
      screen: 'Home',
    });
    expect(reporter.leaveBreadcrumb).toHaveBeenCalledWith(
      'tapped save',
      undefined,
    );
    expect(reporter.setUser).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('logs an error when no reporter is configured', () => {
    __resetLogger('debug');
    const transport = jest.fn();
    logger.addTransport(transport);

    crashReporter.recordError(new Error('unreported'));

    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'error' }),
    );
  });
});
