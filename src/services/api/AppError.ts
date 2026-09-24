/**
 * The application's own error model (AGENTS.md 20, brief section 13).
 *
 * Every failure crossing into application code becomes an AppError first, so
 * UI and feature code never branch on a vendor's error shape. Replacing the
 * HTTP client is then a change to the normaliser, not to every catch block.
 */
export type AppErrorKind =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'server'
  | 'notFound'
  | 'timeout'
  | 'cancelled'
  | 'parse'
  | 'unknown';

export type AppErrorOptions = {
  kind: AppErrorKind;
  /** Safe to show a user. Never a raw exception message (rule 20). */
  message: string;
  status?: number;
  /** Machine-readable code from the API, for branching in feature code. */
  code?: string;
  /** Field-level messages, keyed by field name. */
  fieldErrors?: Record<string, string>;
  /** The original failure, kept for logging only. */
  cause?: unknown;
};

const DEFAULT_MESSAGES: Record<AppErrorKind, string> = {
  validation: 'Please check the details you entered.',
  authentication: 'Please sign in to continue.',
  authorization: 'You do not have access to this.',
  network: 'No connection. Check your network and try again.',
  server: 'Something went wrong on our end. Please try again.',
  notFound: 'We could not find what you were looking for.',
  timeout: 'That took too long. Please try again.',
  cancelled: 'The request was cancelled.',
  parse: 'We received an unexpected response.',
  unknown: 'Something went wrong. Please try again.',
};

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly fieldErrors: Record<string, string> | undefined;
  override readonly cause: unknown;

  constructor({
    kind,
    message,
    status,
    code,
    fieldErrors,
    cause,
  }: AppErrorOptions) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.cause = cause;

    // Without this, `instanceof AppError` fails for subclasses when the
    // output targets ES5 semantics.
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /** True when retrying the same request could plausibly succeed. */
  get isRetryable(): boolean {
    return (
      this.kind === 'network' ||
      this.kind === 'timeout' ||
      (this.kind === 'server' && this.status !== 501)
    );
  }

  /** True when the user must re-authenticate. */
  get requiresAuthentication(): boolean {
    return this.kind === 'authentication';
  }

  static from(kind: AppErrorKind, overrides: Partial<AppErrorOptions> = {}) {
    return new AppError({
      kind,
      message: overrides.message ?? DEFAULT_MESSAGES[kind],
      ...overrides,
    });
  }
}

/** Narrow an unknown caught value. */
export const isAppError = (value: unknown): value is AppError =>
  value instanceof AppError;

/**
 * Last-resort normaliser for values caught outside the API layer.
 *
 * Anything already normalised passes through unchanged; everything else
 * becomes `unknown` with its original value preserved as the cause, so the
 * detail survives for logging without reaching the user.
 */
export const toAppError = (value: unknown): AppError => {
  if (isAppError(value)) {
    return value;
  }

  return AppError.from('unknown', { cause: value });
};

export const defaultMessageFor = (kind: AppErrorKind): string =>
  DEFAULT_MESSAGES[kind];
