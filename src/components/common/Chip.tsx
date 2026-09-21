import type { StyleProp, ViewStyle } from 'react-native';

import { AppPressable } from '@components/primitives';
import { useTheme } from '@theme';

import { AppText } from './AppText';

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Selectable filter token.
 *
 * Reports `selected` through accessibilityState so assistive technology
 * announces the state rather than relying on the fill colour (rule 28).
 */
export const Chip = ({
  label,
  selected = false,
  disabled = false,
  onPress,
  style,
  testID,
}: ChipProps) => {
  const { theme } = useTheme();

  return (
    <AppPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          height: theme.sizes.control.small,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          borderWidth: theme.sizes.border.hairline,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected
            ? theme.colors.primarySubtle
            : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
        style,
      ]}
      testID={testID}>
      <AppText
        color={disabled ? 'disabled' : selected ? 'link' : 'secondary'}
        variant="label">
        {label}
      </AppText>
    </AppPressable>
  );
};
