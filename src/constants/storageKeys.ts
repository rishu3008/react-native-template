/**
 * Every persisted key lives here (AGENTS.md 18, 45). Namespaced so that
 * clearing template data never touches keys written by a host application.
 */
export const storageKeys = {
  themePreference: '@template/theme-preference',
  onboardingCompleted: '@template/onboarding-completed',
  /**
   * Names the environment the stored credentials belong to. Absent means a
   * fresh install; a different name means a build from another environment
   * was installed over this one. Either way the keychain is purged.
   */
  credentialOwner: '@template/credential-owner',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
