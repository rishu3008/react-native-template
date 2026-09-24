/**
 * Raw colour palette.
 *
 * Nothing outside the theme layer may import this file. Components consume
 * semantic colours (`theme.colors.text.primary`), never palette values, so
 * that re-theming does not mean editing components (AGENTS.md 9, 10).
 */
export const palette = {
  neutral0: '#FFFFFF',
  neutral50: '#F8FAFC',
  neutral100: '#F1F5F9',
  neutral200: '#E2E8F0',
  neutral300: '#CBD5E1',
  neutral400: '#94A3B8',
  neutral500: '#64748B',
  neutral600: '#475569',
  neutral700: '#334155',
  neutral800: '#1E293B',
  neutral900: '#0F172A',
  neutral950: '#020617',

  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  red300: '#FCA5A5',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',

  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',

  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  yellow400: '#FDE047',
  yellow500: '#FACC15',
  yellow600: '#EAB308',

  transparent: 'transparent',
} as const;

export type PaletteColor = (typeof palette)[keyof typeof palette];
