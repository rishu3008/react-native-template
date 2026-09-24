import type { ViewStyle } from 'react-native';

import type {
  Breakpoint,
  Radius,
  ShadowLevel,
  Spacing,
  TypographyVariant,
} from './tokens';

/**
 * Semantic colour roles (AGENTS.md 10).
 *
 * Components reference roles, never palette entries, so that light and dark
 * themes -- and any future brand theme -- are interchangeable.
 */
export type ThemeColors = {
  background: string;
  surface: string;
  /** Raised surfaces: cards, sheets, menus. */
  surfaceElevated: string;
  /** Pressed/hover wash over a surface. */
  surfacePressed: string;

  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
    /** Text drawn on top of a `primary` fill. */
    onPrimary: string;
  };

  border: string;
  borderStrong: string;

  primary: string;
  primaryPressed: string;
  primarySubtle: string;

  secondary: string;
  secondaryPressed: string;

  error: string;
  errorSubtle: string;
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;

  /** Scrim behind modals and sheets. */
  overlay: string;

  disabled: string;
  /** Focus ring, used for keyboard and switch-control focus. */
  focus: string;

  transparent: string;
};

export type ThemeMode = 'light' | 'dark';

/** What the user chose. `system` follows the device appearance. */
export type ThemePreference = ThemeMode | 'system';

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: Record<Spacing, number>;
  radius: Record<Radius, number>;
  typography: Record<TypographyVariant, object>;
  shadows: Record<ShadowLevel, ViewStyle>;
  sizes: typeof import('./tokens/sizes').sizes;
  breakpoints: Record<Breakpoint, number>;
  zIndex: typeof import('./tokens/zIndex').zIndex;
};
