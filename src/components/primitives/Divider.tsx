import { View, type ViewProps } from 'react-native';

import { useTheme, type Spacing } from '@theme';

export type DividerProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  spacing?: Spacing;
  color?: string;
};

/**
 * Hairline rule.
 *
 * Marked `accessibilityElementsHidden`/`importantForAccessibility="no"` so it
 * is skipped by screen readers -- a decorative line is noise in the
 * accessibility tree (AGENTS.md 28).
 */
export const Divider = ({
  orientation = 'horizontal',
  spacing: spacingToken,
  color,
  style,
  ...rest
}: DividerProps) => {
  const { theme } = useTheme();
  const thickness = theme.sizes.border.hairline;
  const gap = spacingToken != null ? theme.spacing[spacingToken] : 0;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        {
          backgroundColor: color ?? theme.colors.border,
          ...(orientation === 'horizontal'
            ? { height: thickness, alignSelf: 'stretch', marginVertical: gap }
            : {
                width: thickness,
                alignSelf: 'stretch',
                marginHorizontal: gap,
              }),
        },
        style,
      ]}
      {...rest}
    />
  );
};
