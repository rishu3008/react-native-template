import { useWindowDimensions } from 'react-native';

import { breakpoints, type Breakpoint } from '@theme';

export type BreakpointInfo = {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  isLandscape: boolean;
  /** True at `name` or wider. */
  isAtLeast: (name: Breakpoint) => boolean;
};

/**
 * Responsive layout state (AGENTS.md 30).
 *
 * Built on useWindowDimensions, which already subscribes to size changes, so
 * values stay correct through rotation, split-screen and foldables. Reading
 * Dimensions.get() at module scope freezes the value at import and never
 * updates -- that is the bug this hook exists to prevent.
 *
 * Breakpoints change *layout*, not scale. Do not use these to grow the type
 * scale on tablets: a tablet should show more content, not larger content.
 */
export const useBreakpoint = (): BreakpointInfo => {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= breakpoints.large
      ? 'large'
      : width >= breakpoints.expanded
        ? 'expanded'
        : width >= breakpoints.medium
          ? 'medium'
          : 'compact';

  return {
    breakpoint,
    width,
    height,
    isLandscape: width > height,
    isAtLeast: (name: Breakpoint) => width >= breakpoints[name],
  };
};
