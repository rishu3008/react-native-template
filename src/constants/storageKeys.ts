/**
 * Every persisted key lives here (AGENTS.md 18, 45). Namespaced so that
 * clearing template data never touches keys written by a host application.
 */
export const storageKeys = {
  themePreference: '@template/theme-preference',
  onboardingCompleted: '@template/onboarding-completed',
  /**
   * Written on first launch after an install. Its absence means a fresh
   * install, which is how the keychain purge below detects one.
   */
  installMarker: '@template/install-marker',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
