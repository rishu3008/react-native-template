/**
 * Every persisted key lives here (AGENTS.md 18, 45). Namespaced so that
 * clearing template data never touches keys written by a host application.
 */
export const storageKeys = {
  themePreference: '@template/theme-preference',
  onboardingCompleted: '@template/onboarding-completed',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
