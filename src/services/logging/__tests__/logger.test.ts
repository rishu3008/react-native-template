import { __resetLogger, logger, redact } from '@services';

describe('redact', () => {
  it.each([
    'password',
    'accessToken',
    'auth_token',
    'Authorization',
    'apiKey',
    'sessionId',
    'cardNumber',
  ])('redacts %s', key => {
    expect(redact({ [key]: 'secret-value' })).toEqual({ [key]: '[redacted]' });
  });

  it('leaves harmless fields intact', () => {
    expect(redact({ userId: '42', count: 3 })).toEqual({
      userId: '42',
      count: 3,
    });
  });

  it('redacts nested values', () => {
    expect(redact({ user: { name: 'Ada', password: 'hunter2' } })).toEqual({
      user: { name: 'Ada', password: '[redacted]' },
    });
  });

  it('redacts inside arrays', () => {
    expect(redact([{ token: 'abc' }])).toEqual([{ token: '[redacted]' }]);
  });

  it('truncates rather than recursing forever', () => {
    // A cyclic object must not make logging the thing that crashes the app.
    const cyclic: Record<string, unknown> = { name: 'root' };
    cyclic.self = cyclic;

    expect(() => redact(cyclic)).not.toThrow();
  });
});

describe('logger', () => {
  beforeEach(() => {
    __resetLogger('debug');
  });

  it('delivers entries to registered transports', () => {
    const transport = jest.fn();
    logger.addTransport(transport);

    logger.info('hello', { userId: '1' });

    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info', message: 'hello' }),
    );
  });

  it('redacts context before it reaches a transport', () => {
    const transport = jest.fn();
    logger.addTransport(transport);

    logger.info('sign in', { email: 'a@b.com', password: 'hunter2' });

    // Transports are where logs leave the app, so redaction must happen
    // before this point, not inside each transport.
    expect(transport.mock.calls[0]?.[0].context).toEqual({
      email: 'a@b.com',
      password: '[redacted]',
    });
  });

  it('suppresses entries below the current level', () => {
    const transport = jest.fn();
    logger.addTransport(transport);
    logger.setLevel('warn');

    logger.debug('noisy');
    logger.info('also noisy');
    logger.warn('important');

    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0]?.[0].message).toBe('important');
  });

  it('removes a transport when its teardown runs', () => {
    const transport = jest.fn();
    const remove = logger.addTransport(transport);

    remove();
    logger.error('after removal');

    expect(transport).not.toHaveBeenCalled();
  });

  it('keeps working when a transport throws', () => {
    const broken = jest.fn(() => {
      throw new Error('transport exploded');
    });
    const healthy = jest.fn();
    logger.addTransport(broken);
    logger.addTransport(healthy);

    expect(() => logger.info('still fine')).not.toThrow();
    expect(healthy).toHaveBeenCalledTimes(1);
  });
});
