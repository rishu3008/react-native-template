import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme, type Radius, type ShadowLevel, type Spacing } from '@theme';

export type BoxProps = ViewProps & {
  padding?: Spacing;
  paddingHorizontal?: Spacing;
  paddingVertical?: Spacing;
  margin?: Spacing;
  marginHorizontal?: Spacing;
  marginVertical?: Spacing;
  /** Semantic surface role, or any resolved colour string. */
  backgroundColor?: string;
  radius?: Radius;
  shadow?: ShadowLevel;
  borderWidth?: number;
  borderColor?: string;
  flex?: number;
};

/**
 * Layout primitive. A themed View that speaks in spacing tokens rather than
 * raw numbers (AGENTS.md 9, 12).
 */
export const Box = ({
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  backgroundColor,
  radius: radiusToken,
  shadow,
  borderWidth,
  borderColor,
  flex,
  style,
  ...rest
}: BoxProps) => {
  const { theme } = useTheme();

  const resolved: ViewStyle = {
    ...(padding != null && { padding: theme.spacing[padding] }),
    ...(paddingHorizontal != null && {
      paddingHorizontal: theme.spacing[paddingHorizontal],
    }),
    ...(paddingVertical != null && {
      paddingVertical: theme.spacing[paddingVertical],
    }),
    ...(margin != null && { margin: theme.spacing[margin] }),
    ...(marginHorizontal != null && {
      marginHorizontal: theme.spacing[marginHorizontal],
    }),
    ...(marginVertical != null && {
      marginVertical: theme.spacing[marginVertical],
    }),
    ...(backgroundColor != null && { backgroundColor }),
    ...(radiusToken != null && { borderRadius: theme.radius[radiusToken] }),
    ...(borderWidth != null && { borderWidth }),
    ...(borderColor != null && { borderColor }),
    ...(flex != null && { flex }),
  };

  return (
    <View
      style={[resolved, shadow != null && theme.shadows[shadow], style]}
      {...rest}
    />
  );
};
