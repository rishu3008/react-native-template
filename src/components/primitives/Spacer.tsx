import { View } from 'react-native';

import { useTheme, type Spacing } from '@theme';

export type SpacerProps = {
  size?: Spacing;
  /** Fill the remaining space instead of a fixed size. */
  flex?: boolean;
};

/**
 * Fixed or flexible gap. Prefer `gap` on Row/Stack for evenly spaced groups;
 * Spacer is for one-off separation, typically pushing siblings apart.
 */
export const Spacer = ({ size = 'md', flex = false }: SpacerProps) => {
  const { theme } = useTheme();

  if (flex) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={{ width: theme.spacing[size], height: theme.spacing[size] }} />
  );
};
