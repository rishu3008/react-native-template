import type { AppError } from './AppError';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestConfig = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  /** Overrides the client default. */
  timeoutMs?: number;
  /** Skip the Authorization header, e.g. for sign-in itself. */
  skipAuth?: boolean;
  /** Skip retries even if the failure is retryable. */
  skipRetry?: boolean;
  signal?: AbortSignal;
};

/**
 * Runs before every request. Use for headers; not for business logic --
 * an interceptor that navigates or mutates app state is exactly the hidden
 * behaviour rule 63 forbids.
 */
export type RequestInterceptor = (
  config: RequestConfig,
  headers: Record<string, string>,
) => Promise<Record<string, string>> | Record<string, string>;

/** Runs on every AppError. Return true to retry the request once. */
export type ErrorInterceptor = (
  error: AppError,
  config: RequestConfig,
) => Promise<boolean> | boolean;

export type ApiClientOptions = {
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
};
