/**
 * Storage contracts (AGENTS.md 18, 48).
 *
 * Application code depends on this interface, never on a vendor SDK, so the
 * backing library can be replaced without touching callers. A separate
 * SecureStorageService is deliberately the narrower of the two: secrets are
 * read and written individually, never enumerated or bulk-cleared.
 */
export type SecureStorageService = {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

export type StorageService = {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  getObject<T>(key: string): Promise<T | null>;
  setObject<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
};
