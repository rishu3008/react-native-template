import type { StyleProp, ViewStyle } from 'react-native';

import { AppPressable, Box } from '@components/primitives';
import { useTheme, type ShadowLevel, type Spacing } from '@theme';

export type CardProps = {
  children: React.ReactNode;
  padding?: Spacing;
  shadow?: ShadowLevel;
  bordered?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Surface container. Unprefixed: `Card` shadows no React Native export
 * (rule 8.1).
 *
 * Becomes a button only when `onPress` is supplied, so a static card is not
 * announced as interactive (rule 28).
 */
export const Card = ({
  children,
  padding = 'lg',
  shadow = 'sm',
  bordered = false,
  onPress,
  accessibilityLabel,
  style,
  testID,
}: CardProps) => {
  const { theme } = useTheme();

  const surface: ViewStyle = {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[padding],
    ...(bordered && {
      borderWidth: theme.sizes.border.hairline,
      borderColor: theme.colors.border,
    }),
    ...theme.shadows[shadow],
  };

  if (onPress != null) {
    return (
      <AppPressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={[surface, style]}
        testID={testID}>
        {children}
      </AppPressable>
    );
  }

  return (
    <Box style={[surface, style]} testID={testID}>
      {children}
    </Box>
  );
};
