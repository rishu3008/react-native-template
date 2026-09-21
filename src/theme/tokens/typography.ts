import type { TextStyle } from 'react-native';

/**
 * Typography variants (AGENTS.md 11).
 *
 * Components pick a variant; they do not set fontSize/fontWeight/lineHeight
 * individually. Changing the type scale is then a single edit here.
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
  Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>
> &
  Pick<TextStyle, 'letterSpacing'>;

export const typography: Record<TypographyVariant, VariantStyle> = {
  display: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  heading2: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  heading3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  button: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
};
