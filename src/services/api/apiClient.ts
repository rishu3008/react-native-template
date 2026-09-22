import { appConfig } from '@constants';

import { AppError } from './AppError';
import { normalizeHttpError, normalizeTransportError } from './normalizeError';
import type {
  ApiClientOptions,
  ErrorInterceptor,
  RequestConfig,
  RequestInterceptor,
} from './types';

const buildUrl = (
  baseUrl: string,
  path: string,
  query?: RequestConfig['query'],
): string => {
  const url = new URL(
    path.startsWith('/') ? path.slice(1) : path,
    baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`,
  );

  for (const [key, value] of Object.entries(query ?? {})) {
    // Undefined params are dropped rather than serialised as "undefined",
    // which is what a naive template string would send.
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
};

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

/**
 * The only place in the template that performs HTTP (AGENTS.md 15).
 *
 * Screens never reach this directly: they go through a hook, which goes
 * through a service. It owns base URL, headers, auth injection, timeouts,
 * retries and error normalisation, so no caller ever sees a fetch Response
 * or a raw thrown TypeError.
 *
 * Built on fetch rather than a client library: interceptors and retry are the
 * only features that would have been inherited, and both are implemented here
 * anyway to keep them behind this boundary (rules 48, 66).
 */
export class ApiClient {
  private readonly options: ApiClientOptions;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];

  constructor(options: ApiClientOptions) {
    this.options = options;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index >= 0) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index >= 0) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  get<T>(path: string, config: Omit<RequestConfig, 'path' | 'method'> = {}) {
    return this.request<T>({ ...config, path, method: 'GET' });
  }

  post<T>(
    path: string,
    body?: unknown,
    config: Omit<RequestConfig, 'path' | 'method' | 'body'> = {},
  ) {
    return this.request<T>({ ...config, path, method: 'POST', body });
  }

  put<T>(
    path: string,
    body?: unknown,
    config: Omit<RequestConfig, 'path' | 'method' | 'body'> = {},
  ) {
    return this.request<T>({ ...config, path, method: 'PUT', body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    config: Omit<RequestConfig, 'path' | 'method' | 'body'> = {},
  ) {
    return this.request<T>({ ...config, path, method: 'PATCH', body });
  }

  delete<T>(path: string, config: Omit<RequestConfig, 'path' | 'method'> = {}) {
    return this.request<T>({ ...config, path, method: 'DELETE' });
  }

  async request<T>(config: RequestConfig): Promise<T> {
    return this.execute<T>(config, 0, false);
  }

  private async execute<T>(
    config: RequestConfig,
    attempt: number,
    afterInterceptorRetry: boolean,
  ): Promise<T> {
    try {
      return await this.performRequest<T>(config);
    } catch (caught) {
      const error =
        caught instanceof AppError
          ? caught
          : AppError.from('unknown', { cause: caught });

      // A cancelled request is the caller's decision. Retrying it would
      // resurrect work the caller explicitly abandoned.
      if (error.kind === 'cancelled') {
        throw error;
      }

      // Error interceptors run once per request, not once per attempt: a
      // token refresh that fails should not be attempted again on every
      // retry of the same call.
      if (!afterInterceptorRetry) {
        for (const interceptor of this.errorInterceptors) {
          if (await interceptor(error, config)) {
            return this.execute<T>(config, attempt, true);
          }
        }
      }

      const canRetry =
        config.skipRetry !== true &&
        error.isRetryable &&
        attempt < this.options.maxRetries;

      if (!canRetry) {
        throw error;
      }

      // Exponential backoff. Without it, a server already struggling gets
      // every client's retries at the same instant.
      await delay(2 ** attempt * 300);

      return this.execute<T>(config, attempt + 1, afterInterceptorRetry);
    }
  }

  private async performRequest<T>(config: RequestConfig): Promise<T> {
    const { path, method = 'GET', body, query, signal } = config;

    let headers: Record<string, string> = {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...config.headers,
    };

    for (const interceptor of this.requestInterceptors) {
      headers = await interceptor(config, headers);
    }

    const controller = new AbortController();
    const timeoutMs = config.timeoutMs ?? this.options.timeoutMs;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    // The caller's signal and the timeout both have to be able to abort, so
    // the caller's is forwarded rather than replaced.
    const onCallerAbort = () => controller.abort();
    signal?.addEventListener('abort', onCallerAbort);

    let response: Response;

    try {
      response = await fetch(buildUrl(this.options.baseUrl, path, query), {
        method,
        headers,
        signal: controller.signal,
        ...(body !== undefined && { body: JSON.stringify(body) }),
      });
    } catch (error) {
      throw normalizeTransportError(error, timedOut);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onCallerAbort);
    }

    return this.parseResponse<T>(response);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    // 204 and empty bodies are success, not a parse failure.
    const raw = await response.text();
    const hasBody = raw.length > 0;

    let parsed: unknown;

    if (hasBody) {
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        // A non-JSON body on an error response is common (an HTML error page
        // from a proxy). The status still decides the kind; only a
        // successful response with unreadable content is a parse failure.
        if (!response.ok) {
          throw normalizeHttpError(response.status, { message: raw });
        }

        throw AppError.from('parse', { status: response.status, cause: error });
      }
    }

    if (!response.ok) {
      throw normalizeHttpError(response.status, parsed);
    }

    return parsed as T;
  }
}

export const apiClient = new ApiClient({
  baseUrl: appConfig.apiBaseUrl,
  timeoutMs: appConfig.apiTimeoutMs,
  maxRetries: appConfig.apiMaxRetries,
});
