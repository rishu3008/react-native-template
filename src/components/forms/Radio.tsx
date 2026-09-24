import type { StyleProp, ViewStyle } from 'react-native';

import { AppText } from '@components/common/AppText';
import { AppPressable, Box, Row } from '@components/primitives';
import { useTheme } from '@theme';

export type RadioProps = {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Single radio option (AGENTS.md 28).
 *
 * Unlike Checkbox this never toggles off on re-press: deselecting a radio is
 * the enclosing group's job, and a self-toggling radio would let a required
 * group end up with nothing selected.
 */
export const Radio = ({
  selected,
  onSelect,
  label,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}: RadioProps) => {
  const { theme } = useTheme();
  const outer = theme.sizes.icon.large;

  return (
    <AppPressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onSelect}
      style={style}
      testID={testID}>
      <Row gap="sm" style={{ minHeight: theme.sizes.minTouchTarget }}>
        <Box
          style={{
            width: outer,
            height: outer,
            borderRadius: theme.radius.full,
            borderWidth: theme.sizes.border.thick,
            borderColor: disabled
              ? theme.colors.border
              : selected
                ? theme.colors.primary
                : theme.colors.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {selected && (
            <Box
              style={{
                width: outer / 2,
                height: outer / 2,
                borderRadius: theme.radius.full,
                backgroundColor: disabled
                  ? theme.colors.disabled
                  : theme.colors.primary,
              }}
            />
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
