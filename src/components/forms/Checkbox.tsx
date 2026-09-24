import type { StyleProp, ViewStyle } from 'react-native';

import { AppText } from '@components/common/AppText';
import { AppPressable, Box, Row } from '@components/primitives';
import { useTheme } from '@theme';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Checkbox (AGENTS.md 28).
 *
 * Reports `accessibilityRole="checkbox"` with a `checked` state, so assistive
 * technology announces the state rather than inferring it from the tick mark.
 * The whole row is the target, not just the 20dp box.
 */
export const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  error = false,
  accessibilityHint,
  style,
  testID,
}: CheckboxProps) => {
  const { theme } = useTheme();
  const boxSize = theme.sizes.icon.large;

  const borderColor = error
    ? theme.colors.error
    : checked
      ? theme.colors.primary
      : theme.colors.borderStrong;

  return (
    <AppPressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={style}
      testID={testID}>
      <Row gap="sm" style={{ minHeight: theme.sizes.minTouchTarget }}>
        <Box
          style={{
            width: boxSize,
            height: boxSize,
            borderRadius: theme.radius.sm,
            borderWidth: theme.sizes.border.thick,
            borderColor: disabled ? theme.colors.border : borderColor,
            backgroundColor: checked
              ? disabled
                ? theme.colors.disabled
                : theme.colors.primary
              : theme.colors.transparent,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {checked && (
            <AppText
              color="onPrimary"
              style={{ fontSize: 14, lineHeight: 16 }}
              variant="caption">
              ✓
            </AppText>
          )}
        </Box>

        {label != null && (
          <AppText
            color={disabled ? 'disabled' : 'primary'}
            style={{ flex: 1 }}
            variant="body">
            {label}
          </AppText>
        )}
      </Row>
    </AppPressable>
  );
};
