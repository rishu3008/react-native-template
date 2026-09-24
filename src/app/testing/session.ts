import { sessionManager, tokenManager } from '@services';

/**
 * Puts the app into a signed-in state for tests.
 *
 * Writes tokens through tokenManager rather than stubbing the provider, so
 * tests exercise the real restore path -- including the fresh-install purge,
 * which is the part most likely to break silently.
 */
export const signInForTest = async (): Promise<void> => {
  await tokenManager.clearForeignCredentials();
  await tokenManager.save({
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: Date.now() + 60 * 60 * 1000,
  });
};

/** Returns the app to a signed-out state and drops cached tokens. */
export const signOutForTest = async (): Promise<void> => {
  sessionManager.reset();
  await tokenManager.clear();
};
