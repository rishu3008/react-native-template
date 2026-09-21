import type { StyleProp, ViewStyle } from 'react-native';

import { Box } from '@components/primitives';
import { useTheme } from '@theme';

import { AppText } from './AppText';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Small status marker.
 *
 * Tone drives both background and text colour so the label never relies on
 * colour alone to carry meaning (rule 28).
 */
export const Badge = ({
  label,
  tone = 'neutral',
  style,
  testID,
}: BadgeProps) => {
  const { theme } = useTheme();

  const tones: Record<BadgeTone, { background: string; text: string }> = {
    neutral: {
      background: theme.colors.surfacePressed,
      text: theme.colors.text.secondary,
    },
    primary: {
      background: theme.colors.primarySubtle,
      text: theme.colors.primary,
    },
    success: {
      background: theme.colors.successSubtle,
      text: theme.colors.success,
    },
    warning: {
      background: theme.colors.warningSubtle,
      text: theme.colors.warning,
    },
    error: { background: theme.colors.errorSubtle, text: theme.colors.error },
  };

  return (
    <Box
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: tones[tone].background,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
        },
        style,
      ]}
      testID={testID}>
      <AppText style={{ color: tones[tone].text }} variant="caption">
        {label}
      </AppText>
    </Box>
  );
};
