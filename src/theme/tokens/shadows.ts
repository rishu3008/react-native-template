import { Platform, type ViewStyle } from 'react-native';

export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';

/**
 * Elevation, expressed per platform.
 *
 * iOS draws shadows from shadowOffset/Opacity/Radius; Android derives them
 * from `elevation`. Setting only one gives a shadow on a single platform, so
 * both are always emitted together.
 */
const build = (
  elevation: number,
  offsetHeight: number,
  opacity: number,
  blur: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: offsetHeight },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;

export const shadows: Record<ShadowLevel, ViewStyle> = {
  none: Platform.select<ViewStyle>({
    ios: { shadowOpacity: 0 },
    android: { elevation: 0 },
    default: {},
  }) as ViewStyle,
  sm: build(2, 1, 0.08, 2),
  md: build(6, 3, 0.12, 6),
  lg: build(12, 6, 0.16, 12),
};
