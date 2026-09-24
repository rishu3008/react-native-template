import type { LogContext } from './types';

/**
 * Keys whose values are replaced before a log leaves the app (rule 22).
 *
 * Matched case-insensitively on substrings, because the same secret arrives
 * as `token`, `accessToken` and `auth_token` depending on the caller. Over-
 * redacting a harmless field is cheap; leaking a credential into a log
 * aggregator is not.
 */
const SENSITIVE_PATTERNS = [
  'password',
  'passwd',
  'secret',
  'token',
  'authorization',
  'auth',
  'credential',
  'cookie',
  'session',
  'apikey',
  'api_key',
  'pin',
  'cvv',
  'card',
  'ssn',
];

const REDACTED = '[redacted]';

const isSensitive = (key: string): boolean => {
  const normalized = key.toLowerCase();
  return SENSITIVE_PATTERNS.some(pattern => normalized.includes(pattern));
};

/**
 * Deep-redact a log context.
 *
 * Depth-limited: a cyclic or very deep object would otherwise recurse until
 * the stack gives out, and a log call must never be the thing that crashes
 * the app.
 */
export const redact = (value: unknown, depth = 0): unknown => {
  if (depth > 5) {
    return '[truncated]';
  }

  if (Array.isArray(value)) {
    return value.map(item => redact(item, depth + 1));
  }

  if (value == null || typeof value !== 'object') {
    return value;
  }

  const result: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    result[key] = isSensitive(key) ? REDACTED : redact(entry, depth + 1);
  }

  return result;
};

export const redactContext = (
  context: LogContext | undefined,
): LogContext | undefined =>
  context == null ? undefined : (redact(context) as LogContext);
