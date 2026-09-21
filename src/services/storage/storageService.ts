import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageService } from './types';

/**
 * AsyncStorage-backed implementation of {@link StorageService}.
 *
 * Reads never throw: storage being unavailable or holding malformed JSON is a
 * recoverable condition, and callers get `null` so they can fall back to a
 * default rather than crash at startup (AGENTS.md 20).
 */
export const storageService: StorageService = {
  async getString(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setString(key, value) {
    await AsyncStorage.setItem(key, value);
  },

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw == null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },

  async setObject<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key) {
    await AsyncStorage.removeItem(key);
  },

  async clear() {
    await AsyncStorage.clear();
  },
};
