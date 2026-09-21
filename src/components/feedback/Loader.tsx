import {
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@components/common/AppText';
import { Stack } from '@components/primitives';
import { useTheme } from '@theme';

export type LoaderProps = {
  /** Announced to assistive technology and shown beneath the spinner. */
  label?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Inline loading indicator (AGENTS.md 21).
 *
 * Carries an accessibility label so a screen reader announces that work is in
 * progress; a bare spinner is silent (rule 28).
 */
export const Loader = ({
  label,
  size = 'small',
  color,
  style,
  testID,
}: LoaderProps) => {
  const { theme } = useTheme();

  return (
    <Stack
      // `accessible` is required as well as the role: a View with only a
      // role set is not exposed as a single element to assistive technology.
      accessibilityLabel={label ?? 'Loading'}
      accessibilityRole="progressbar"
      accessible
      align="center"
      gap="sm"
      style={style}
      testID={testID}>
      <ActivityIndicator color={color ?? theme.colors.primary} size={size} />
      {label != null && (
        <AppText color="secondary" variant="bodySmall">
          {label}
        </AppText>
      )}
    </Stack>
  );
};
