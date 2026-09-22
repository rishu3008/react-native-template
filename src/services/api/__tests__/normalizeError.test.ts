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
  it('distinguishes a timeout from a cancellation', () => {
    const aborted = new Error('Aborted');
    aborted.name = 'AbortError';

    // Both surface as AbortError from fetch, but one is the user's decision
    // and the other is a failure worth retrying.
    expect(normalizeTransportError(aborted, true).kind).toBe('timeout');
    expect(normalizeTransportError(aborted, false).kind).toBe('cancelled');
  });

  it('maps a fetch TypeError to a network failure', () => {
    expect(
      normalizeTransportError(new TypeError('Network request failed'), false)
        .kind,
    ).toBe('network');
  });

  it('falls back to unknown', () => {
    expect(normalizeTransportError({ weird: true }, false).kind).toBe(
      'unknown',
    );
  });
});
