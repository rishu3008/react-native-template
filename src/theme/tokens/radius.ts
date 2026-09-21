export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  /** Large enough to fully round any control this template ships. */
  full: 9999,
} as const;

export type Radius = keyof typeof radius;
