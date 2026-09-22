import { AppError, isAppError, toAppError } from '@services';

describe('AppError', () => {
  it('supplies user-safe default copy per kind', () => {
    // Raw exception text must never reach a user (rule 20).
    expect(AppError.from('network').message).toMatch(/connection/i);
    expect(AppError.from('authentication').message).toMatch(/sign in/i);
  });

  it('keeps the original failure as a cause without exposing it', () => {
    const cause = new Error('ECONNREFUSED 10.0.0.1:443');
    const error = AppError.from('network', { cause });

    expect(error.cause).toBe(cause);
    expect(error.message).not.toContain('ECONNREFUSED');
  });

  it('treats transport and 5xx failures as retryable', () => {
    expect(AppError.from('network').isRetryable).toBe(true);
    expect(AppError.from('timeout').isRetryable).toBe(true);
    expect(AppError.from('server', { status: 503 }).isRetryable).toBe(true);
  });

  it('does not retry failures a retry cannot fix', () => {
    expect(AppError.from('validation').isRetryable).toBe(false);
    expect(AppError.from('notFound').isRetryable).toBe(false);
    expect(AppError.from('authorization').isRetryable).toBe(false);
    // 501 is the server saying it will never implement this.
    expect(AppError.from('server', { status: 501 }).isRetryable).toBe(false);
  });

  it('flags only authentication failures as needing re-auth', () => {
    expect(AppError.from('authentication').requiresAuthentication).toBe(true);
    expect(AppError.from('authorization').requiresAuthentication).toBe(false);
  });

  it('survives instanceof across the class boundary', () => {
    const error = AppError.from('unknown');

    expect(isAppError(error)).toBe(true);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it('passes an existing AppError through unchanged', () => {
    const original = AppError.from('notFound');

    expect(toAppError(original)).toBe(original);
  });

  it('wraps anything else as unknown, preserving the value', () => {
    const wrapped = toAppError('a string was thrown');

    expect(wrapped.kind).toBe('unknown');
    expect(wrapped.cause).toBe('a string was thrown');
  });
});
