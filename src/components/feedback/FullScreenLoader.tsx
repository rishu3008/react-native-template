import { View } from 'react-native';

import { useTheme } from '@theme';

import { Loader } from './Loader';

export type FullScreenLoaderProps = {
  label?: string;
  /** Draw over existing content rather than replacing it. */
  overlay?: boolean;
  testID?: string;
};

/**
 * Fills its parent with a centred loader (AGENTS.md 21).
 *
 * As an overlay it blocks touches to whatever is underneath, so a screen
 * cannot be interacted with mid-operation.
 */
export const FullScreenLoader = ({
  label,
  overlay = false,
  testID,
}: FullScreenLoaderProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: overlay
            ? theme.colors.overlay
            : theme.colors.background,
        },
        overlay && {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.overlay,
        },
      ]}
      testID={testID}>
      <Loader label={label} size="large" />
    </View>
  );
};
