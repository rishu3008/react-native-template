import { AppError } from '@services/api/AppError';

import type { AuthService, AuthTokens, Credentials } from './authTypes';

const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

/** Simulated latency, so loading states are visible while developing. */
const LATENCY_MS = 600;

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

const issueTokens = (): AuthTokens => ({
  accessToken: `mock-access-${Date.now()}`,
  refreshToken: `mock-refresh-${Date.now()}`,
  expiresAt: Date.now() + TOKEN_LIFETIME_MS,
});

/**
 * Development stand-in for a real backend (AGENTS.md 2).
 *
 * The template ships no server, so without this the sign-in screen is a dead
 * end and nothing behind it can be seen. It accepts any syntactically valid
 * credentials and issues local tokens.
 *
 * This is scaffolding, not a feature: it is selected by configuration in
 * bootstrap, never imported by screens, and `appConfig.useMockAuth` is false
 * outside development so it cannot reach a release build.
 */
export const mockAuthService: AuthService = {
  async signIn({ email, password }: Credentials) {
    await delay(LATENCY_MS);

    // Enough validation to exercise the error path, not a validation library.
    if (!email.includes('@')) {
      throw AppError.from('validation', {
        message: 'Enter a valid email address.',
        fieldErrors: { email: 'Enter a valid email address.' },
      });
    }

    if (password.length < 4) {
      throw AppError.from('validation', {
        message: 'Password must be at least 4 characters.',
        fieldErrors: { password: 'Password must be at least 4 characters.' },
      });
    }

    return issueTokens();
  },

  async signOut() {
    await delay(200);
  },

  async refresh(refreshToken: string) {
    await delay(300);

    if (!refreshToken.startsWith('mock-refresh')) {
      throw AppError.from('authentication');
    }

    return issueTokens();
  },
};
