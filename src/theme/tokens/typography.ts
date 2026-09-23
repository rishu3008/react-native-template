import type { TextStyle } from 'react-native';

/**
 * Font families (AGENTS.md 11).
 *
 * React Native does not synthesise weights from a single family the way the
 * web does: `fontWeight: '600'` against a regular face gives either the
 * regular face or a faked bold, depending on platform. Each weight is a
 * separate file and a separate family name.
 *
 * These are PostScript names, which is what iOS resolves. They match the
 * filenames, which is what Android resolves, so one value works on both. A
 * font whose two names differ needs Platform.select here.
 *
 * Run `npm run fonts` after adding a file to src/assets/fonts.
 */
export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export type FontWeightName = keyof typeof fontFamily;

/**
 * Typography variants.
 *
 * Components pick a variant; they do not set fontSize/fontWeight/lineHeight
 * individually. Changing the type scale is then a single edit here.
 *
 * fontWeight is kept alongside fontFamily so the text still has the right
 * weight if a face fails to load, rather than silently rendering regular.
 */
export type TypographyVariant =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

type VariantStyle = Required<
  Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'fontFamily'>
> &
  Pick<TextStyle, 'letterSpacing'>;

export const typography: Record<TypographyVariant, VariantStyle> = {
  display: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    letterSpacing: -0.5,
  },
  heading1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
    letterSpacing: -0.25,
  },
  heading2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: fontFamily.semiBold,
  },
  heading3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: fontFamily.semiBold,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: fontFamily.regular,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: fontFamily.regular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: fontFamily.regular,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fontFamily.medium,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: fontFamily.semiBold,
  },
};
