import { apiClient } from '@services/api/apiClient';

import type { AuthService, AuthTokens, Credentials } from './authTypes';

type TokenResponse = {
  accessToken?: unknown;
  refreshToken?: unknown;
  expiresIn?: unknown;
};

/**
 * Maps the server's token payload to AuthTokens.
 *
 * `expiresIn` is a duration; everything downstream compares against a
 * timestamp. Converting once here means no other code has to remember which
 * of the two it is holding.
 */
const toTokens = (payload: TokenResponse): AuthTokens => {
  const { accessToken, refreshToken, expiresIn } = payload;

  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
    throw new Error('Token response was missing a token');
  }

  const seconds = typeof expiresIn === 'number' ? expiresIn : 3600;

  return {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + seconds * 1000,
  };
};

/**
 * HTTP implementation of the auth contract (AGENTS.md 19).
 *
 * The endpoint paths are placeholders; a consuming app repoints them at its
 * own backend. What the template fixes is the shape: sign-in, sign-out and
 * refresh, all returning the same AuthTokens, so sessionManager never has to
 * know how a particular backend spells things.
 *
 * `skipAuth` on sign-in and refresh is required: attaching an expired access
 * token to the call that renews it is how refresh loops start.
 */
export const authService: AuthService = {
  async signIn(credentials: Credentials) {
    const response = await apiClient.post<TokenResponse>(
      '/auth/sign-in',
      credentials,
      { skipAuth: true },
    );

    return toTokens(response);
  },

  async signOut() {
    await apiClient.post('/auth/sign-out', undefined, { skipRetry: true });
  },

  async refresh(refreshToken: string) {
    const response = await apiClient.post<TokenResponse>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true, skipRetry: true },
    );

    return toTokens(response);
  },
};
