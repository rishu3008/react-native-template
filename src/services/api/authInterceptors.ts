import { sessionManager } from '@services/auth/sessionManager';

import type { ApiClient } from './apiClient';

/**
 * Wires authentication into the API client (AGENTS.md 15, 19).
 *
 * Kept out of ApiClient itself so the client stays a transport concern with
 * no opinion about sessions, and out of sessionManager so the session layer
 * does not depend on the client's internals. Bootstrap connects the two.
 *
 * Returns a teardown function; tests and hot reload need to be able to
 * detach rather than stack duplicate interceptors.
 */
export const installAuthInterceptors = (client: ApiClient): (() => void) => {
  const removeRequest = client.addRequestInterceptor(
    async (config, headers) => {
      if (config.skipAuth === true) {
        return headers;
      }

      const token = await sessionManager.getAccessToken();

      return token == null
        ? headers
        : { ...headers, Authorization: `Bearer ${token}` };
    },
  );

  const removeError = client.addErrorInterceptor(async (error, config) => {
    // Only a 401 on an authenticated call is worth refreshing for. A 401 from
    // the refresh endpoint itself means the session is genuinely over.
    if (!error.requiresAuthentication || config.skipAuth === true) {
      return false;
    }

    const refreshed = await sessionManager.refresh();

    // Returning true replays the original request once, now with the new
    // token. sessionManager has already signed the user out if it failed.
    return refreshed != null;
  });

  return () => {
    removeRequest();
    removeError();
  };
};
