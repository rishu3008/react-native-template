import type { StyleProp, ViewStyle } from 'react-native';

import { AppPressable, Box, Row, Stack } from '@components/primitives';
import { useTheme } from '@theme';

import { AppText } from './AppText';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Row in a list.
 *
 * Title and subtitle are merged into a single accessibility label so a screen
 * reader announces the row once, rather than as two unrelated fragments
 * (rule 28).
 */
export const ListItem = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  onPress,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}: ListItemProps) => {
  const { theme } = useTheme();

  const content = (
    <Row
      gap="md"
      style={{
        minHeight: theme.sizes.control.large,
        paddingVertical: theme.spacing.sm,
      }}>
      {leftElement}

      <Stack gap="xxs" style={{ flex: 1 }}>
        <AppText color={disabled ? 'disabled' : 'primary'} variant="body">
          {title}
        </AppText>
        {subtitle != null && (
          <AppText color="secondary" variant="bodySmall">
            {subtitle}
          </AppText>
        )}
      </Stack>

      {rightElement}
    </Row>
  );

  if (onPress == null) {
    return (
      <Box style={style} testID={testID}>
        {content}
      </Box>
    );
  }

  return (
    <AppPressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={subtitle != null ? `${title}, ${subtitle}` : title}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={style}
      testID={testID}>
      {content}
    </AppPressable>
  );
};
