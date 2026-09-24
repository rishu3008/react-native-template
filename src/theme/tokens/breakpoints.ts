/**
 * Width breakpoints, in dp (AGENTS.md 30, brief section 30).
 *
 * Layout decisions read these through `useBreakpoint()` rather than calling
 * Dimensions.get() at arbitrary call sites.
 */
export const breakpoints = {
  /** Phones in portrait. */
  compact: 0,
  /** Large phones, small tablets in portrait. */
  medium: 600,
  /** Tablets, foldables opened. */
  expanded: 840,
  /** Large tablets and desktop-class windows. */
  large: 1200,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const contentMaxWidth = {
  text: 680,
  form: 480,
} as const;
