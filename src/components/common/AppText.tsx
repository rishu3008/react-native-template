import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme, type TypographyVariant } from '@theme';

export type AppTextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'inverse'
  | 'onPrimary'
  | 'error'
  | 'success'
  | 'warning'
  | 'link';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: AppTextColor;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
};

/**
 * The only text component in the template (AGENTS.md 11).
 *
 * Prefixed because `Text` is a React Native export (rule 8.1).
 *
 * Font scaling stays enabled so OS text-size settings are respected, but is
 * capped at 1.6x: beyond that, layouts built for the default scale break
 * outright, which serves large-text users worse than a bounded increase
 * (rule 28).
 */
export const AppText = ({
  variant = 'body',
  color = 'primary',
  align,
  weight,
  style,
  maxFontSizeMultiplier = 1.6,
  ...rest
}: AppTextProps) => {
  const { theme } = useTheme();

  const resolveColor = (): string => {
    switch (color) {
      case 'secondary':
        return theme.colors.text.secondary;
      case 'disabled':
        return theme.colors.text.disabled;
      case 'inverse':
        return theme.colors.text.inverse;
      case 'onPrimary':
        return theme.colors.text.onPrimary;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'link':
        return theme.colors.primary;
      case 'primary':
        return theme.colors.text.primary;
    }
  };

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        theme.typography[variant] as TextStyle,
        { color: resolveColor() },
        align != null && { textAlign: align },
        weight != null && { fontWeight: weight },
        style,
      ]}
      {...rest}
    />
  );
};
