import { logger } from '@services/logging';

import type { AnalyticsAdapter, AnalyticsEvent } from './types';

/** Logs instead of sending, so event wiring is verifiable without a vendor. */
const noopAdapter: AnalyticsAdapter = {
  track: event => logger.debug(`analytics: ${event.name}`, event.properties),
  screen: name => logger.debug(`analytics: screen ${name}`),
  identify: userId => logger.debug(`analytics: identify ${userId}`),
  reset: () => undefined,
};

let current: AnalyticsAdapter = noopAdapter;

export const analytics: AnalyticsAdapter & {
  configure: (adapter: AnalyticsAdapter) => void;
  restoreDefault: () => void;
} = {
  track: (event: AnalyticsEvent) => current.track(event),
  screen: (name, properties) => current.screen(name, properties),
  identify: (userId, traits) => current.identify(userId, traits),
  reset: () => current.reset(),
  configure: adapter => {
    current = adapter;
  },
  restoreDefault: () => {
    current = noopAdapter;
  },
};
