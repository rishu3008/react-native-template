import type { StyleProp, ViewStyle } from 'react-native';

import { AppText } from '@components/common/AppText';
import { Box } from '@components/primitives';
import { useTheme } from '@theme';

export type OfflineBannerProps = {
  visible: boolean;
  message?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Connectivity notice (AGENTS.md 21).
 *
 * Deliberately presentational: it takes `visible` rather than subscribing to
 * connectivity itself. Network detection is a service concern, and rule 63
 * forbids a reusable component quietly owning a subscription. The connectivity
 * hook that drives it arrives with the networking layer.
 */
export const OfflineBanner = ({
  visible,
  message = 'No internet connection',
  style,
  testID,
}: OfflineBannerProps) => {
  const { theme } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Box
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        {
          backgroundColor: theme.colors.warningSubtle,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          zIndex: theme.zIndex.banner,
        },
        style,
      ]}
      testID={testID}>
      <AppText
        align="center"
        style={{ color: theme.colors.warning }}
        variant="bodySmall">
        {message}
      </AppText>
    </Box>
  );
};
