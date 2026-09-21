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
  background: palette.neutral50,
  surface: palette.neutral0,
  surfaceElevated: palette.neutral0,
  surfacePressed: palette.neutral100,

  text: {
    primary: palette.neutral900,
    secondary: palette.neutral600,
    disabled: palette.neutral400,
    inverse: palette.neutral0,
    onPrimary: palette.neutral0,
  },

  border: palette.neutral200,
  borderStrong: palette.neutral300,

  primary: palette.blue600,
  primaryPressed: palette.blue700,
  primarySubtle: '#EFF6FF',

  secondary: palette.neutral700,
  secondaryPressed: palette.neutral800,

  error: palette.red600,
  errorSubtle: '#FEF2F2',
  success: palette.green600,
  successSubtle: '#F0FDF4',
  warning: palette.amber600,
  warningSubtle: '#FFFBEB',

  overlay: 'rgba(15, 23, 42, 0.45)',

  disabled: palette.neutral200,
  focus: palette.blue500,

  transparent: palette.transparent,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors,
  spacing,
  radius,
  typography,
  shadows,
  sizes,
  breakpoints,
  zIndex,
};
