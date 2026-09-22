import AsyncStorage from '@react-native-async-storage/async-storage';

import { storageKeys } from '@constants';
import { sessionManager, tokenManager, type AuthService } from '@services';

const validTokens = (overrides: Partial<{ expiresAt: number }> = {}) => ({
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresAt: Date.now() + 3_600_000,
  ...overrides,
});

const makeAuthService = (): jest.Mocked<AuthService> => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  refresh: jest.fn(),
});

describe('sessionManager', () => {
  let auth: jest.Mocked<AuthService>;

  beforeEach(async () => {
    sessionManager.reset();
    await tokenManager.clear();
    await AsyncStorage.clear();
    // Mark the install as seen so the fresh-install purge does not fire in
    // tests that are not about it.
    await AsyncStorage.setItem(storageKeys.installMarker, 'installed');
    auth = makeAuthService();
    sessionManager.configure(auth);
  });

  describe('restore', () => {
    it('reports signed out when there are no tokens', async () => {
      await expect(sessionManager.restore()).resolves.toBe(false);
    });

    it('reports signed in for a valid token', async () => {
      await tokenManager.save(validTokens());

      await expect(sessionManager.restore()).resolves.toBe(true);
    });

    it('refreshes rather than signing out an expired token', async () => {
      await tokenManager.save(validTokens({ expiresAt: Date.now() - 1000 }));
      auth.refresh.mockResolvedValue(validTokens());

      // Bouncing every returning user to sign-in because their access token
      // aged out overnight is the failure this prevents.
      await expect(sessionManager.restore()).resolves.toBe(true);
      expect(auth.refresh).toHaveBeenCalledWith('refresh-1');
    });

    it('signs out when the refresh token is rejected', async () => {
      await tokenManager.save(validTokens({ expiresAt: Date.now() - 1000 }));
      auth.refresh.mockRejectedValue(new Error('invalid_grant'));

      await expect(sessionManager.restore()).resolves.toBe(false);
      expect(await tokenManager.load()).toBeNull();
    });
  });

  describe('fresh install', () => {
    it('purges credentials left behind by a previous install', async () => {
      await tokenManager.save(validTokens());
      // iOS keeps keychain items across an uninstall; AsyncStorage does not.
      // An absent marker alongside a populated keychain is that situation.
      await AsyncStorage.clear();
      tokenManager.resetCache();

      await expect(sessionManager.restore()).resolves.toBe(false);
      expect(await tokenManager.load()).toBeNull();
    });

    it('leaves an existing install alone', async () => {
      await tokenManager.save(validTokens());

      await expect(sessionManager.restore()).resolves.toBe(true);
      expect(await tokenManager.load()).not.toBeNull();
    });

    it('writes the marker so the purge happens only once', async () => {
      await AsyncStorage.clear();

      await sessionManager.restore();

      expect(await AsyncStorage.getItem(storageKeys.installMarker)).toBe(
        'installed',
      );
    });
  });

  describe('refresh coalescing', () => {
    it('performs one refresh for concurrent callers', async () => {
      await tokenManager.save(validTokens({ expiresAt: Date.now() - 1000 }));

      let resolveRefresh: (
        value: ReturnType<typeof validTokens>,
      ) => void = () => {};
      auth.refresh.mockReturnValue(
        new Promise(resolve => {
          resolveRefresh = resolve;
        }),
      );

      const all = Promise.all([
        sessionManager.refresh(),
        sessionManager.refresh(),
        sessionManager.refresh(),
      ]);

      resolveRefresh(validTokens({ expiresAt: Date.now() + 7_200_000 }));
      await all;

      // Servers rotate refresh tokens. A second concurrent refresh would send
      // one the server has already invalidated, signing the user out during a
      // successful refresh.
      expect(auth.refresh).toHaveBeenCalledTimes(1);
    });

    it('allows a new refresh after the previous one settles', async () => {
      await tokenManager.save(validTokens({ expiresAt: Date.now() - 1000 }));
      auth.refresh.mockResolvedValue(
        validTokens({ expiresAt: Date.now() - 1000 }),
      );

      await sessionManager.refresh();
      await sessionManager.refresh();

      expect(auth.refresh).toHaveBeenCalledTimes(2);
    });
  });

  describe('sign out', () => {
    it('clears tokens even when the server call fails', async () => {
      await tokenManager.save(validTokens());
      auth.signOut.mockRejectedValue(new Error('network down'));

      await sessionManager.signOut();

      expect(await tokenManager.load()).toBeNull();
    });

    it('notifies subscribers', async () => {
      const listener = jest.fn();
      sessionManager.subscribe(listener);
      auth.signIn.mockResolvedValue(validTokens());

      await sessionManager.signIn('a@example.com', 'pw');
      expect(listener).toHaveBeenLastCalledWith(true);

      await sessionManager.signOut();
      expect(listener).toHaveBeenLastCalledWith(false);
    });
  });

  describe('getAccessToken', () => {
    it('returns the current token when it is fresh', async () => {
      await tokenManager.save(validTokens());

      await expect(sessionManager.getAccessToken()).resolves.toBe('access-1');
      expect(auth.refresh).not.toHaveBeenCalled();
    });

    it('refreshes a token that is about to expire', async () => {
      // Inside the skew window: still technically valid, but would expire
      // mid-request.
      await tokenManager.save(validTokens({ expiresAt: Date.now() + 5_000 }));
      auth.refresh.mockResolvedValue({
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        expiresAt: Date.now() + 3_600_000,
      });

      await expect(sessionManager.getAccessToken()).resolves.toBe('access-2');
    });

    it('returns null when there is no session', async () => {
      await expect(sessionManager.getAccessToken()).resolves.toBeNull();
    });
  });
});
