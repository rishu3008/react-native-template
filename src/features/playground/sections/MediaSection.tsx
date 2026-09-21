import {
  AppIcon,
  AppImage,
  AppText,
  Avatar,
  Card,
  Row,
  Stack,
} from '@components';
import { HeartIcon, StarIcon } from '@assets/icons';
import { useTheme } from '@theme';

const REMOTE_IMAGE = {
  uri: 'https://picsum.photos/seed/templateproject/400/240',
};

const BROKEN_IMAGE = { uri: 'https://example.invalid/missing.jpg' };

export const MediaSection = () => {
  const { theme } = useTheme();

  return (
    <Stack gap="md">
      <AppText variant="heading3">Images and icons</AppText>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          AppImage
        </AppText>
        <AppImage
          accessibilityLabel="Example photograph"
          radius="lg"
          source={REMOTE_IMAGE}
          style={{ width: '100%', height: 160 }}
        />
        <AppText color="secondary" variant="caption">
          Remote image with a loading state while it fetches.
        </AppText>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Failed load falls back
        </AppText>
        <AppImage
          fallback={
            <Card bordered shadow="none">
              <AppText color="secondary" variant="bodySmall">
                Image unavailable
              </AppText>
            </Card>
          }
          source={BROKEN_IMAGE}
          style={{ width: '100%', height: 64 }}
        />
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          AppIcon, sized and coloured from the theme
        </AppText>
        <Row gap="lg">
          <AppIcon size="small" source={StarIcon} />
          <AppIcon size="medium" source={StarIcon} />
          <AppIcon size="large" source={StarIcon} />
          <AppIcon size="xlarge" source={StarIcon} />
        </Row>
        <Row gap="lg">
          <AppIcon color={theme.colors.primary} source={HeartIcon} />
          <AppIcon color={theme.colors.error} source={HeartIcon} />
          <AppIcon color={theme.colors.success} source={HeartIcon} />
          <AppIcon
            accessibilityLabel="Favourite"
            color={theme.colors.warning}
            source={HeartIcon}
          />
        </Row>
        <AppText color="secondary" variant="caption">
          Icons are decorative by default. The last one has a label, so it is
          the only one a screen reader announces.
        </AppText>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Avatar
        </AppText>
        <Row gap="md">
          <Avatar name="Ada Lovelace" size="small" />
          <Avatar name="Grace Hopper" size="medium" />
          <Avatar name="Alan Turing" size="large" />
          <Avatar size="xlarge" source={REMOTE_IMAGE} />
        </Row>
        <AppText color="secondary" variant="caption">
          Initials when there is no image, and when a remote one fails.
        </AppText>
      </Stack>
    </Stack>
  );
};
