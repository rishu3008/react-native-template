export type CrashUser = {
  id: string;
  /** Anything here reaches a third party. Never PII you cannot justify. */
  attributes?: Record<string, string>;
};

/**
 * Crash reporting contract (AGENTS.md 48, brief section 22).
 *
 * The template ships no vendor. Sentry, Crashlytics or anything else is
 * plugged in by implementing this and registering it at bootstrap, so
 * application code never imports a vendor SDK and swapping one is a single
 * registration change.
 */
export type CrashReporter = {
  recordError: (error: unknown, context?: Record<string, unknown>) => void;
  /** Breadcrumbs give a crash its preceding sequence of events. */
  leaveBreadcrumb: (message: string, data?: Record<string, unknown>) => void;
  setUser: (user: CrashUser | null) => void;
};
