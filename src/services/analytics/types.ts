/**
 * Analytics contract (AGENTS.md 48, brief section 22).
 *
 * Events are named, not free-form strings at call sites: a typo produces a
 * second event that looks real in a dashboard and is never noticed.
 */
export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean>;
};

export type AnalyticsAdapter = {
  track: (event: AnalyticsEvent) => void;
  screen: (name: string, properties?: Record<string, string>) => void;
  identify: (userId: string, traits?: Record<string, string>) => void;
  reset: () => void;
};
