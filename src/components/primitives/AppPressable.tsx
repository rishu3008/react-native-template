import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  type LayoutChangeEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@theme';

export type AppPressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Opacity applied while pressed. Set to 1 to opt out. */
  pressedOpacity?: number;
};

/**
 * Pressable with the template's interaction and accessibility defaults
 * (AGENTS.md 28).
 *
 * Prefixed because `Pressable` is a React Native export (rule 8.1).
 *
 * Guarantees a minimum 44dp hit area: rather than forcing a minimum size on
 * the visual element -- which would distort small icon buttons -- it measures
 * the laid-out box and expands `hitSlop` to make up any shortfall.
 */
export const AppPressable = ({
  style,
  pressedOpacity = 0.6,
  disabled,
  accessibilityState,
  onLayout,
  hitSlop,
  ...rest
}: AppPressableProps) => {
  const { theme } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize({ width, height });
      onLayout?.(event);
    },
    [onLayout],
  );

  const resolvedHitSlop = useMemo(() => {
    if (hitSlop != null) {
      return hitSlop;
    }

    const min = theme.sizes.minTouchTarget;
    const horizontal = Math.max(0, (min - size.width) / 2);
    const vertical = Math.max(0, (min - size.height) / 2);

    if (horizontal === 0 && vertical === 0) {
      return undefined;
    }

    return {
      left: horizontal,
      right: horizontal,
      top: vertical,
      bottom: vertical,
    };
  }, [hitSlop, size.height, size.width, theme.sizes.minTouchTarget]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled === true,
        ...accessibilityState,
      }}
      disabled={disabled}
      hitSlop={resolvedHitSlop}
      onLayout={handleLayout}
      style={({ pressed }) => [
        style,
        pressed && !(disabled === true) && { opacity: pressedOpacity },
      ]}
      {...rest}
    />
  );
};
