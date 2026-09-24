import type { ViewStyle } from 'react-native';

import type { Spacing } from '@theme';
import { useTheme } from '@theme';

import { Box, type BoxProps } from './Box';

export type RowProps = BoxProps & {
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  /** Space between children. */
  gap?: Spacing;
  wrap?: boolean;
};

/**
 * Horizontal stack.
 *
 * Uses `flexDirection: 'row'`, which React Native mirrors automatically under
 * RTL, so this primitive is direction-safe by default (AGENTS.md 29).
 */
export const Row = ({
  align = 'center',
  justify = 'flex-start',
  gap,
  wrap = false,
  style,
  ...rest
}: RowProps) => {
  const { theme } = useTheme();

  return (
    <Box
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          justifyContent: justify,
          ...(gap != null && { gap: theme.spacing[gap] }),
          ...(wrap && { flexWrap: 'wrap' }),
        },
        style,
      ]}
      {...rest}
    />
  );
};
