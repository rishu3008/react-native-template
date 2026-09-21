import type { StyleProp, ViewStyle } from 'react-native';

import { Box } from '@components/primitives';
import { useTheme } from '@theme';

import { AppImage } from './AppImage';
import { AppText } from './AppText';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

export type AvatarProps = {
  /** Remote or local image. Falls back to initials when absent or broken. */
  source?: { uri: string };
  name?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');

/** Unprefixed: `Avatar` shadows no React Native export (rule 8.1). */
export const Avatar = ({
  source,
  name,
  size = 'medium',
  style,
  testID,
}: AvatarProps) => {
  const { theme } = useTheme();
  const dimension = theme.sizes.avatar[size];

  const placeholder = (
    <Box
      style={{
        width: dimension,
        height: dimension,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText color="link" variant={size === 'small' ? 'caption' : 'label'}>
        {name != null && name.length > 0 ? initialsOf(name) : '?'}
      </AppText>
    </Box>
  );

  return (
    <Box
      accessibilityLabel={name != null ? `${name} avatar` : 'Avatar'}
      accessibilityRole="image"
      style={style}
      testID={testID}>
      {source != null ? (
        <AppImage
          accessibilityLabel={name}
          fallback={placeholder}
          source={source}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: theme.radius.full,
          }}
        />
      ) : (
        placeholder
      )}
    </Box>
  );
};
