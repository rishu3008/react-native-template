import { logger } from '@services/logging';

import type { CrashReporter, CrashUser } from './types';

/**
 * No-op reporter used until a vendor is registered.
 *
 * Routes to the logger rather than discarding, so crash reporting is visible
 * in development before any SDK exists -- and so the absence of a vendor is
 * never silent.
 */
const noopReporter: CrashReporter = {
  recordError: (error, context) => {
    logger.error('Crash reporter not configured', error, context);
  },
  leaveBreadcrumb: (message, data) => {
    logger.debug(`breadcrumb: ${message}`, data);
  },
  setUser: () => undefined,
};

let current: CrashReporter = noopReporter;

export const crashReporter: CrashReporter & {
  configure: (reporter: CrashReporter) => void;
  reset: () => void;
} = {
  recordError: (error, context) => current.recordError(error, context),
  leaveBreadcrumb: (message, data) => current.leaveBreadcrumb(message, data),
  setUser: (user: CrashUser | null) => current.setUser(user),
  configure: reporter => {
    current = reporter;
  },
  reset: () => {
    current = noopReporter;
  },
};
