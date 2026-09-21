import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import { useTheme } from '@theme';

export type AppIconSize = 'small' | 'medium' | 'large' | 'xlarge';

export type AppIconProps = Omit<SvgProps, 'width' | 'height' | 'color'> & {
  /**
   * An SVG imported as a component:
   * `import Logo from '@assets/icons/logo.svg'`
   */
  source: FC<SvgProps>;
  size?: AppIconSize | number;
  /** Resolved colour. Defaults to the primary text colour. */
  color?: string;
  accessibilityLabel?: string;
};

/**
 * Renders an SVG at a token size in a theme colour.
 *
 * Adapter over react-native-svg (rule 48): icons are SVG components produced
 * by the Metro transformer, so they scale without raster assets per density.
 *
 * Decorative by default -- an icon beside a visible label is noise to a
 * screen reader. Passing accessibilityLabel opts it back into the
 * accessibility tree for standalone icons (rule 28).
 */
export const AppIcon = ({
  source: Svg,
  size = 'medium',
  color,
  accessibilityLabel,
  ...rest
}: AppIconProps) => {
  const { theme } = useTheme();
  const dimension = typeof size === 'number' ? size : theme.sizes.icon[size];

  return (
    <Svg
      accessibilityLabel={accessibilityLabel}
      accessible={accessibilityLabel != null}
      color={color ?? theme.colors.text.primary}
      height={dimension}
      importantForAccessibility={
        accessibilityLabel != null ? 'yes' : 'no-hide-descendants'
      }
      width={dimension}
      {...rest}
    />
  );
};
