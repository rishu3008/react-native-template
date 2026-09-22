import { AppError, type AppErrorKind } from './AppError';

/** Shape most JSON APIs use for errors. Everything is optional by design. */
type ApiErrorBody = {
  message?: unknown;
  error?: unknown;
  code?: unknown;
  errors?: unknown;
};

const kindForStatus = (status: number): AppErrorKind => {
  if (status === 401) return 'authentication';
  if (status === 403) return 'authorization';
  if (status === 404) return 'notFound';
  if (status === 408 || status === 504) return 'timeout';
  if (status === 422 || status === 400) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

/**
 * Field errors as `{ field: message }`.
 *
 * Accepts both `{ email: 'taken' }` and `{ email: ['taken', ...] }`, because
 * APIs disagree and the form layer should not have to care which it received.
 */
const asFieldErrors = (value: unknown): Record<string, string> | undefined => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const result: Record<string, string> = {};

  for (const [field, raw] of Object.entries(value as Record<string, unknown>)) {
    const message = Array.isArray(raw) ? asString(raw[0]) : asString(raw);
    if (message != null) {
      result[field] = message;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

/**
 * Turn an HTTP response into an AppError (rule 20).
 *
 * The server's message is used only for validation failures, where it names
 * the field the user got wrong. For every other kind the default copy is
 * used: server messages leak implementation detail and are rarely written
 * for end users.
 */
export const normalizeHttpError = (status: number, body: unknown): AppError => {
  const kind = kindForStatus(status);
  const parsed = (body ?? {}) as ApiErrorBody;
  const fieldErrors = asFieldErrors(parsed.errors);
  const serverMessage = asString(parsed.message) ?? asString(parsed.error);

  return AppError.from(kind, {
    status,
    ...(asString(parsed.code) != null && { code: asString(parsed.code) }),
    ...(fieldErrors != null && { fieldErrors }),
    ...(kind === 'validation' && serverMessage != null
      ? { message: serverMessage }
      : {}),
    cause: body,
  });
};

/**
 * Turn a thrown transport failure into an AppError.
 *
 * fetch rejects with a TypeError for DNS, TLS and offline failures, and an
 * AbortError when the caller or the timeout cancels it. Those are different
 * user-facing situations, so they must not collapse into one kind.
 */
export const normalizeTransportError = (
  error: unknown,
  wasTimeout: boolean,
): AppError => {
  if (wasTimeout) {
    return AppError.from('timeout', { cause: error });
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return AppError.from('cancelled', { cause: error });
  }

  if (error instanceof TypeError) {
    return AppError.from('network', { cause: error });
  }

  return AppError.from('unknown', { cause: error });
};
