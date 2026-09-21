import {
  AppText,
  Avatar,
  Badge,
  Card,
  Divider,
  ListItem,
  Row,
  Stack,
} from '@components';

export const SurfacesSection = () => (
  <Stack gap="sm">
    <AppText variant="heading3">Surfaces</AppText>
    <Card>
      <Stack gap="sm">
        <Row gap="md">
          <Avatar name="Ada Lovelace" />
          <Stack gap="xxs" style={{ flex: 1 }}>
            <AppText variant="label">Ada Lovelace</AppText>
            <AppText color="secondary" variant="caption">
              ada@example.com
            </AppText>
          </Stack>
          <Badge label="Pro" tone="primary" />
        </Row>
        <Divider spacing="xs" />
        <Row gap="sm" wrap>
          <Badge label="Neutral" />
          <Badge label="Success" tone="success" />
          <Badge label="Warning" tone="warning" />
          <Badge label="Error" tone="error" />
        </Row>
      </Stack>
    </Card>

    <Card bordered onPress={() => undefined} shadow="none">
      <AppText variant="body">Pressable card</AppText>
    </Card>
  </Stack>
);

export const ListSection = () => (
  <Stack gap="none">
    <AppText variant="heading3">List</AppText>
    <ListItem
      onPress={() => undefined}
      subtitle="Theme, language, notifications"
      title="Preferences"
    />
    <Divider />
    <ListItem
      onPress={() => undefined}
      subtitle="Password and two-factor"
      title="Security"
    />
    <Divider />
    <ListItem subtitle="Read-only row" title="About" />
  </Stack>
);
