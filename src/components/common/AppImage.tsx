import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import FastImage, {
  type FastImageProps,
  type OnErrorEvent,
  type ResizeMode,
  type Source,
} from '@d11/react-native-fast-image';

import { useTheme, type Radius } from '@theme';

export type AppImageProps = Omit<
  FastImageProps,
  'source' | 'fallback' | 'style'
> & {
  source: Source | number;
  radius?: Radius;
  /** Rendered while the image loads. */
  showLoader?: boolean;
  /**
   * Rendered if the image fails to load. Shadows FastImage's own boolean
   * `fallback` prop, which selects its legacy renderer -- a different concern
   * that callers of this template never need.
   */
  fallback?: React.ReactNode;
  resizeMode?: ResizeMode;
  /**
   * React Native's ImageStyle, not FastImage's.
   *
   * FastImage declares `ImageStyle extends FlexStyle`, but React Native 0.87
   * no longer exports FlexStyle. skipLibCheck hides the unresolved reference,
   * leaving its ImageStyle without width, height or any other layout
   * property. Exposing RN's type keeps callers writing ordinary image styles;
   * the cast at the FastImage call site below bridges the two.
   */
  style?: StyleProp<ImageStyle>;
};

/**
 * Prefixed because `Image` is a React Native export (rule 8.1).
 *
 * Adapter over FastImage (rule 48): application code imports AppImage, never
 * the library, so swapping the backing implementation is a change to this one
 * file. Uses the maintained @d11 fork -- the original react-native-fast-image
 * was last published in 2022 and has no New Architecture support (rule 4).
 *
 * Adds the loading and error states raw images lack (rules 21, 31): a remote
 * image that fails renders a fallback rather than an invisible empty box.
 */
export const AppImage = ({
  source,
  radius: radiusToken,
  showLoader = true,
  fallback,
  resizeMode = FastImage.resizeMode.cover,
  style,
  onLoadStart,
  onLoadEnd,
  onError,
  accessibilityLabel,
  ...rest
}: AppImageProps) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const borderRadius =
    radiusToken != null ? theme.radius[radiusToken] : undefined;

  if (hasFailed && fallback != null) {
    return <>{fallback}</>;
  }

  return (
    <View>
      <FastImage
        accessibilityLabel={accessibilityLabel}
        accessible={accessibilityLabel != null}
        onError={(event: OnErrorEvent) => {
          setHasFailed(true);
          setIsLoading(false);
          onError?.(event);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          onLoadEnd?.();
        }}
        onLoadStart={() => {
          setIsLoading(true);
          onLoadStart?.();
        }}
        resizeMode={resizeMode}
        source={source}
        style={
          [
            borderRadius != null && { borderRadius },
            style,
          ] as FastImageProps['style']
        }
        {...rest}
      />

      {showLoader && isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfacePressed,
              ...(borderRadius != null && { borderRadius }),
            },
          ]}>
          <ActivityIndicator color={theme.colors.text.secondary} size="small" />
        </View>
      )}
    </View>
  );
};

/** Re-exported so callers set cache/priority without importing the vendor. */
export const imagePriority = FastImage.priority;
export const imageCacheControl = FastImage.cacheControl;
export const imageResizeMode = FastImage.resizeMode;
