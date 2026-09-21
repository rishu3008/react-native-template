/**
 * Storage contract (AGENTS.md 18, 48).
 *
 * Application code depends on this interface, never on a vendor SDK, so the
 * backing library can be replaced without touching callers. A separate
 * SecureStorage implementation backed by Keychain/Keystore arrives in the
 * auth phase and will satisfy the same shape.
 */
export type StorageService = {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  getObject<T>(key: string): Promise<T | null>;
  setObject<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
};
