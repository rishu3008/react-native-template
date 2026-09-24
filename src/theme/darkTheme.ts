import {
  breakpoints,
  palette,
  radius,
  shadows,
  sizes,
  spacing,
  typography,
  zIndex,
} from './tokens';
import type { Theme, ThemeColors } from './types';

const colors: ThemeColors = {
  background: palette.neutral950,
  surface: palette.neutral900,
  surfaceElevated: palette.neutral800,
  surfacePressed: palette.neutral700,

  text: {
    primary: palette.neutral50,
    secondary: palette.neutral400,
    disabled: palette.neutral600,
    inverse: palette.neutral900,
    onPrimary: palette.neutral0,
  },

  border: palette.neutral800,
  borderStrong: palette.neutral700,

  // Lighter primaries on dark backgrounds: blue600 on neutral950 does not
  // reach the 4.5:1 contrast ratio that body-sized text requires.
  primary: palette.blue400,
  primaryPressed: palette.blue300,
  primarySubtle: '#172554',

  secondary: palette.neutral300,
  secondaryPressed: palette.neutral200,

  error: palette.red400,
  errorSubtle: '#450A0A',
  success: palette.green400,
  successSubtle: '#052E16',
  warning: palette.amber400,
  warningSubtle: '#451A03',

  overlay: 'rgba(2, 6, 23, 0.65)',

  disabled: palette.neutral700,
  focus: palette.blue400,

  transparent: palette.transparent,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors,
  spacing,
  radius,
  typography,
  shadows,
  sizes,
  breakpoints,
  zIndex,
};
