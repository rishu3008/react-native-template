import { AxiosError } from 'axios';

import { normalizeHttpError, normalizeTransportError } from '@services';

describe('normalizeHttpError', () => {
  it.each([
    [401, 'authentication'],
    [403, 'authorization'],
    [404, 'notFound'],
    [408, 'timeout'],
    [422, 'validation'],
    [500, 'server'],
    [503, 'server'],
  ])('maps %i to %s', (status, kind) => {
    expect(normalizeHttpError(status, {}).kind).toBe(kind);
  });

  it('uses the server message for validation failures', () => {
    // Validation messages name the field the user got wrong, so they are the
    // one case worth surfacing verbatim.
    const error = normalizeHttpError(422, { message: 'Email already taken' });

    expect(error.message).toBe('Email already taken');
  });

  it('ignores the server message for non-validation failures', () => {
    // Server messages leak implementation detail and are rarely written for
    // end users.
    const error = normalizeHttpError(500, {
      message: 'NullPointerException at UserRepository.java:412',
    });

    expect(error.message).not.toContain('NullPointerException');
    expect(error.cause).toEqual({
      message: 'NullPointerException at UserRepository.java:412',
    });
  });

  it('extracts field errors given as strings', () => {
    const error = normalizeHttpError(422, { errors: { email: 'is invalid' } });

    expect(error.fieldErrors).toEqual({ email: 'is invalid' });
  });

  it('extracts field errors given as arrays', () => {
    // APIs disagree on this shape; the form layer should not have to care.
    const error = normalizeHttpError(422, {
      errors: { email: ['is invalid', 'is taken'] },
    });

    expect(error.fieldErrors).toEqual({ email: 'is invalid' });
  });

  it('carries the machine-readable code through', () => {
    const error = normalizeHttpError(403, { code: 'PLAN_REQUIRED' });

    expect(error.code).toBe('PLAN_REQUIRED');
  });
});

describe('normalizeTransportError', () => {
  const axiosError = (code: string, extra: Record<string, unknown> = {}) =>
    Object.assign(new AxiosError('failed', code), extra);

  it('reports a timeout as a timeout', () => {
    expect(normalizeTransportError(axiosError('ECONNABORTED')).kind).toBe(
      'timeout',
    );
  });

  it('keeps a cancellation distinct from a timeout', () => {
    // One is the caller's own decision and must never be retried; the other
    // is a failure worth retrying.
    expect(normalizeTransportError(axiosError('ERR_CANCELED')).kind).toBe(
      'cancelled',
    );
  });

  it('reports an unreachable host as a network failure', () => {
    expect(
      normalizeTransportError(axiosError('ERR_NETWORK', { request: {} })).kind,
    ).toBe('network');
  });

  it('uses the response status when the server answered', () => {
    const error = axiosError('ERR_BAD_REQUEST', {
      response: { status: 403, data: {} },
    });

    expect(normalizeTransportError(error).kind).toBe('authorization');
  });

  it('falls back to unknown for anything that is not an axios error', () => {
    expect(normalizeTransportError({ weird: true }).kind).toBe('unknown');
  });
});
