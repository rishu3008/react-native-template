import type { ViewStyle } from 'react-native';

import type { Spacing } from '@theme';
import { useTheme } from '@theme';

import { Box, type BoxProps } from './Box';

export type StackProps = BoxProps & {
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  gap?: Spacing;
};

/** Vertical stack. */
export const Stack = ({
  align,
  justify = 'flex-start',
  gap,
  style,
  ...rest
}: StackProps) => {
  const { theme } = useTheme();

  return (
    <Box
      style={[
        {
          flexDirection: 'column',
          justifyContent: justify,
          ...(align != null && { alignItems: align }),
          ...(gap != null && { gap: theme.spacing[gap] }),
        },
        style,
      ]}
      {...rest}
    />
  );
};
