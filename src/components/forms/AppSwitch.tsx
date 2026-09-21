import { Switch, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@components/common/AppText';
import { Row } from '@components/primitives';
import { useTheme } from '@theme';

export type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Prefixed because `Switch` is a React Native export (rule 8.1).
 *
 * Wraps the platform switch rather than reimplementing it, so it keeps native
 * gesture handling and platform-correct assistive-technology behaviour
 * (rule 48).
 */
export const AppSwitch = ({
  value,
  onValueChange,
  label,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}: AppSwitchProps) => {
  const { theme } = useTheme();

  return (
    <Row
      gap="md"
      justify="space-between"
      style={[{ minHeight: theme.sizes.minTouchTarget }, style]}>
      {label != null && (
        <AppText
          color={disabled ? 'disabled' : 'primary'}
          style={{ flex: 1 }}
          variant="body">
          {label}
        </AppText>
      )}

      <Switch
        accessibilityHint={accessibilityHint}
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onValueChange}
        testID={testID}
        thumbColor={theme.colors.surface}
        trackColor={{
          false: theme.colors.borderStrong,
          true: theme.colors.primary,
        }}
        value={value}
      />
    </Row>
  );
};
