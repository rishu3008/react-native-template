import { useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme, type Radius } from '@theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: Radius;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Pulsing placeholder for content that is still loading (AGENTS.md 21).
 *
 * The pulse runs on the UI thread through Reanimated, so it keeps animating
 * even while the JS thread is busy parsing the response it is waiting for --
 * which is exactly when a JS-driven animation would stutter (rule 32).
 *
 * Hidden from assistive technology: the surrounding container announces the
 * loading state, and a screen reader stepping through placeholder boxes is
 * noise (rule 28).
 */
export const Skeleton = ({
  width = '100%',
  height = 16,
  radius: radiusToken = 'sm',
  style,
  testID,
}: SkeletonProps) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: theme.radius[radiusToken],
          backgroundColor: theme.colors.surfacePressed,
        },
        animatedStyle,
        style,
      ]}
      testID={testID}
    />
  );
};
