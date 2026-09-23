import { AppError } from '@services/api/AppError';

import type { AuthService, AuthTokens } from './authTypes';
import { tokenManager } from './tokenManager';

type SessionListener = (isAuthenticated: boolean) => void;

/**
 * The single owner of session lifecycle (AGENTS.md 19).
 *
 * Everything that needs to know whether the user is signed in subscribes
 * here. Nothing else reads or writes tokens.
 */
let authService: AuthService | null = null;
let refreshInFlight: Promise<AuthTokens | null> | null = null;
const listeners = new Set<SessionListener>();

const notify = (isAuthenticated: boolean) => {
  for (const listener of listeners) {
    listener(isAuthenticated);
  }
};

export const sessionManager = {
  /**
   * Supplied at bootstrap rather than imported, so the session layer does not
   * depend on a particular auth implementation and tests can substitute one.
   */
  configure(service: AuthService): void {
    authService = service;
  },

  subscribe(listener: SessionListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async restore(): Promise<boolean> {
    // Must run before the first token read: on iOS the keychain survives an
    // uninstall, so tokens can be present from a previous install.
    await tokenManager.clearForeignCredentials();

    const tokens = await tokenManager.load();

    if (tokens == null) {
      return false;
    }

    if (!tokenManager.isExpired(tokens)) {
      return true;
    }

    // Expired on launch is recoverable: refresh before deciding the user is
    // signed out, or every returning user is bounced to sign-in.
    return (await this.refresh()) != null;
  },

  async signIn(email: string, password: string): Promise<void> {
    if (authService == null) {
      throw AppError.from('unknown', {
        message: 'Authentication is not configured.',
      });
    }

    const tokens = await authService.signIn({ email, password });
    await tokenManager.save(tokens);
    notify(true);
  },

  async signOut(): Promise<void> {
    // Local state is cleared regardless of what the server says. A failed
    // revoke must not leave the user stuck in a session they asked to end.
    try {
      await authService?.signOut();
    } catch {
      // Intentional: sign-out is local-authoritative.
    }

    await tokenManager.clear();
    notify(false);
  },

  /**
   * Refresh the access token, coalescing concurrent callers.
   *
   * Several requests can fail with 401 at once. Without the in-flight
   * promise each would start its own refresh, and every one after the first
   * would send a refresh token the server has already rotated and
   * invalidated -- signing the user out during a successful refresh.
   */
  async refresh(): Promise<AuthTokens | null> {
    if (refreshInFlight != null) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      const current = await tokenManager.load();

      if (current == null || authService == null) {
        return null;
      }

      try {
        const next = await authService.refresh(current.refreshToken);
        await tokenManager.save(next);
        return next;
      } catch {
        // A refresh token the server rejects is unrecoverable: the session
        // is over, and holding dead tokens would retry forever.
        await tokenManager.clear();
        notify(false);
        return null;
      }
    })();

    try {
      return await refreshInFlight;
    } finally {
      refreshInFlight = null;
    }
  },

  async getAccessToken(): Promise<string | null> {
    const tokens = await tokenManager.load();

    if (tokens == null) {
      return null;
    }

    if (!tokenManager.isExpired(tokens)) {
      return tokens.accessToken;
    }

    return (await this.refresh())?.accessToken ?? null;
  },

  /** Test seam. */
  reset(): void {
    authService = null;
    refreshInFlight = null;
    listeners.clear();
    tokenManager.resetCache();
  },
};
