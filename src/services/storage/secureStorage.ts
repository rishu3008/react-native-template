import * as Keychain from 'react-native-keychain';

import type { SecureStorageService } from './types';

/**
 * Keychain-backed secure storage (AGENTS.md 18).
 *
 * Separate from `storageService` on purpose: tokens belong in the platform
 * keystore, not in AsyncStorage, which is plain files readable on a rooted or
 * jailbroken device.
 *
 * Each key becomes its own keychain "service" entry, because the platform
 * APIs store one credential per service rather than a keyed map.
 */
const serviceFor = (key: string) => `com.templateproject.${key}`;

export const secureStorageService: SecureStorageService = {
  async getString(key) {
    try {
      const result = await Keychain.getGenericPassword({
        service: serviceFor(key),
      });

      return result === false ? null : result.password;
    } catch {
      // A locked or unavailable keychain means no credential, not a crash.
      // Callers treat null as signed out, which is the safe outcome.
      return null;
    }
  },

  async setString(key, value) {
    await Keychain.setGenericPassword(key, value, {
      service: serviceFor(key),
      // Available after first unlock so a background refresh can read the
      // token, but never restored to a different device from a backup.
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },

  async remove(key) {
    try {
      await Keychain.resetGenericPassword({ service: serviceFor(key) });
    } catch {
      // Removing something that is not there is not a failure.
    }
  },
};
