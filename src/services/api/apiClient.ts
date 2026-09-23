import axios, { type AxiosInstance, type AxiosProgressEvent } from 'axios';

import { appConfig } from '@constants';

import { AppError } from './AppError';
import { normalizeTransportError } from './normalizeError';
import type {
  ApiClientOptions,
  ErrorInterceptor,
  ProgressEvent,
  RequestConfig,
  RequestInterceptor,
} from './types';

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

const toProgress = (event: AxiosProgressEvent): ProgressEvent => ({
  loaded: event.loaded,
  total: event.total,
  ratio:
    event.total != null && event.total > 0
      ? event.loaded / event.total
      : undefined,
});

/**
 * The only place in the template that performs HTTP (AGENTS.md 15).
 *
 * Screens never reach this directly: they go through a hook, which goes
 * through a service. It owns base URL, headers, auth injection, timeouts,
 * retries and error normalisation, so no caller ever sees an axios response
 * or an AxiosError.
 *
 * Built on axios rather than fetch for one concrete reason: React Native's
 * fetch is a polyfill over XHR that does not expose upload or download
 * progress, so a file upload cannot report how far it has got. Everything
 * else axios provides -- interceptors, retry, timeouts -- lives behind this
 * boundary anyway (rule 48), which is why swapping the transport was a change
 * to this file alone.
 */
export class ApiClient {
  private readonly options: ApiClientOptions;
  private readonly instance: AxiosInstance;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];

  constructor(options: ApiClientOptions) {
    this.options = options;
    this.instance = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeoutMs,
      headers: { Accept: 'application/json' },
      // Statuses are judged by the normaliser, not by axios, so every
      // response reaches one place rather than splitting across then/catch.
      validateStatus: () => true,
    });
  }

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index >= 0) this.requestInterceptors.splice(index, 1);
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index >= 0) this.errorInterceptors.splice(index, 1);
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

  request<T>(config: RequestConfig): Promise<T> {
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

    let headers: Record<string, string> = { ...config.headers };

    for (const interceptor of this.requestInterceptors) {
      headers = await interceptor(config, headers);
    }

    // Every axios rejection is normalised here. validateStatus lets all
    // statuses resolve, so a rejection means a transport failure -- timeout,
    // cancellation or an unreachable host -- and those must not fall through
    // to the generic handler in execute(), which would flatten them all to
    // `unknown` and lose the distinction the UI needs.
    let response;

    try {
      response = await this.instance.request({
        url: path,
        method,
        headers,
        ...(body !== undefined && { data: body }),
        // Undefined params are dropped by axios rather than serialised as
        // "undefined", which is what a naive template string would send.
        ...(query != null && { params: query }),
        ...(config.timeoutMs != null && { timeout: config.timeoutMs }),
        ...(signal != null && { signal }),
        ...(config.onUploadProgress != null && {
          onUploadProgress: (event: AxiosProgressEvent) =>
            config.onUploadProgress?.(toProgress(event)),
        }),
        ...(config.onDownloadProgress != null && {
          onDownloadProgress: (event: AxiosProgressEvent) =>
            config.onDownloadProgress?.(toProgress(event)),
        }),
      });
    } catch (error) {
      throw normalizeTransportError(error);
    }

    // validateStatus lets everything through, so failures are judged here in
    // one place rather than split between a then and a catch.
    if (response.status < 200 || response.status >= 300) {
      throw normalizeTransportError(
        new axios.AxiosError(
          'Request failed',
          String(response.status),
          response.config,
          response.request,
          response,
        ),
      );
    }

    return response.data as T;
  }
}

export const apiClient = new ApiClient({
  baseUrl: appConfig.apiBaseUrl,
  timeoutMs: appConfig.apiTimeoutMs,
  maxRetries: appConfig.apiMaxRetries,
});
