import { storageKeys } from '@constants';
import { secureStorageService, storageService } from '@services/storage';

import type { AuthTokens } from './authTypes';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const EXPIRES_AT_KEY = 'auth.expiresAt';

/**
 * Treat a token as expired this far ahead of its real expiry.
 *
 * A token that expires while a request is in flight fails the request. The
 * skew means the refresh happens before that window rather than during it.
 */
const EXPIRY_SKEW_MS = 30_000;

/**
 * Owns token persistence and freshness (AGENTS.md 19).
 *
 * Tokens are cached in memory as well as in the keychain: every request needs
 * the access token, and a keychain read per request is both slow and prone to
 * failing while the device is locked.
 */
let cached: AuthTokens | null = null;

export const tokenManager = {
  /**
   * Clear credentials left behind by a previous install (AGENTS.md 19, 23).
   *
   * iOS keeps keychain items when an app is deleted and restores them on
   * reinstall of the same bundle identifier. Without this, a user who
   * uninstalls the app to sign out is still signed in after reinstalling.
   * Android wipes app data on uninstall, so this is a no-op there -- but the
   * check is unconditional, because a platform-specific branch here would be
   * a platform-specific security difference.
   *
   * The marker lives in AsyncStorage precisely because that *is* wiped on
   * uninstall: its absence alongside a populated keychain is the signal.
   */
  async clearIfFreshInstall(): Promise<void> {
    const marker = await storageService.getString(storageKeys.installMarker);

    if (marker != null) {
      return;
    }

    await this.clear();
    await storageService.setString(storageKeys.installMarker, 'installed');
  },

  async load(): Promise<AuthTokens | null> {
    if (cached != null) {
      return cached;
    }

    const [accessToken, refreshToken, expiresAtRaw] = await Promise.all([
      secureStorageService.getString(ACCESS_TOKEN_KEY),
      secureStorageService.getString(REFRESH_TOKEN_KEY),
      secureStorageService.getString(EXPIRES_AT_KEY),
    ]);

    if (accessToken == null || refreshToken == null) {
      return null;
    }

    const expiresAt = Number(expiresAtRaw);

    // A malformed expiry would otherwise make the token look permanently
    // valid or permanently expired, depending on which way NaN compares.
    if (!Number.isFinite(expiresAt)) {
      return null;
    }

    cached = { accessToken, refreshToken, expiresAt };
    return cached;
  },

  async save(tokens: AuthTokens): Promise<void> {
    cached = tokens;

    await Promise.all([
      secureStorageService.setString(ACCESS_TOKEN_KEY, tokens.accessToken),
      secureStorageService.setString(REFRESH_TOKEN_KEY, tokens.refreshToken),
      secureStorageService.setString(EXPIRES_AT_KEY, String(tokens.expiresAt)),
    ]);
  },

  async clear(): Promise<void> {
    cached = null;

    await Promise.all([
      secureStorageService.remove(ACCESS_TOKEN_KEY),
      secureStorageService.remove(REFRESH_TOKEN_KEY),
      secureStorageService.remove(EXPIRES_AT_KEY),
    ]);
  },

  isExpired(tokens: AuthTokens, now: number = Date.now()): boolean {
    return tokens.expiresAt - EXPIRY_SKEW_MS <= now;
  },

  /** Test seam: clears the in-memory copy without touching the keychain. */
  resetCache(): void {
    cached = null;
  },
};
