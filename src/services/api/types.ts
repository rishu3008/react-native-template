import type { AppError } from './AppError';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Bytes transferred so far, for upload and download progress. */
export type ProgressEvent = {
  loaded: number;
  /** Undefined when the server does not send a content length. */
  total: number | undefined;
  /** 0..1, undefined when the total is unknown. */
  ratio: number | undefined;
};

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
  /**
   * Upload and download progress.
   *
   * This is the reason the client is built on axios rather than fetch:
   * React Native's fetch is a polyfill over XHR that does not surface
   * progress events, so a file upload can show no progress at all.
   */
  onUploadProgress?: (event: ProgressEvent) => void;
  onDownloadProgress?: (event: ProgressEvent) => void;
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
