import {
  AppPressable,
  AppText,
  Box,
  Divider,
  Row,
  Spacer,
  Stack,
  useToast,
} from '@components';
import { useTheme } from '@theme';

/**
 * The layout primitives everything else is built from (brief section 39).
 *
 * They are invisible in finished UI by design, so without a surface like this
 * the only way to see what Box, Row, Stack and Spacer actually do is to read
 * them.
 */
export const PrimitivesSection = () => {
  const { theme } = useTheme();
  const toast = useToast();

  // Keyed here rather than at each call site, because one of them maps over a
  // list and the rest do not. React ignores the key outside a list.
  const swatch = (label: string) => (
    <Box
      key={label}
      padding="sm"
      radius="sm"
      style={{ backgroundColor: theme.colors.primarySubtle }}>
      <AppText color="link" variant="caption">
        {label}
      </AppText>
    </Box>
  );

  return (
    <Stack gap="lg">
      <AppText variant="heading3">Primitives</AppText>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Row, with gap and wrapping
        </AppText>
        <Row gap="sm" wrap>
          {['one', 'two', 'three', 'four'].map(swatch)}
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Row with justify=&quot;space-between&quot;
        </AppText>
        <Row justify="space-between">
          {swatch('start')}
          {swatch('end')}
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Spacer, pushing siblings apart
        </AppText>
        <Row>
          {swatch('left')}
          <Spacer flex />
          {swatch('right')}
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Box: spacing, radius and shadow tokens
        </AppText>
        <Row gap="md">
          <Box
            padding="md"
            radius="lg"
            shadow="sm"
            style={{ backgroundColor: theme.colors.surfaceElevated }}>
            <AppText variant="caption">shadow sm</AppText>
          </Box>
          <Box
            padding="md"
            radius="lg"
            shadow="lg"
            style={{ backgroundColor: theme.colors.surfaceElevated }}>
            <AppText variant="caption">shadow lg</AppText>
          </Box>
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          Divider, horizontal and vertical
        </AppText>
        <Divider />
        <Row gap="md" style={{ height: 32 }}>
          {swatch('a')}
          <Divider orientation="vertical" />
          {swatch('b')}
        </Row>
      </Stack>

      <Stack gap="sm">
        <AppText color="secondary" variant="label">
          AppPressable
        </AppText>
        <AppText color="secondary" variant="caption">
          Expands its hit area to 44dp rather than padding the visual element,
          so a small control stays small and still meets the touch target.
        </AppText>
        <Row gap="lg">
          <AppPressable
            accessibilityLabel="Tiny target"
            onPress={() => toast.show({ message: 'Tapped the 16dp box' })}
            testID="tiny-pressable">
            <Box
              radius="sm"
              style={{
                width: 16,
                height: 16,
                backgroundColor: theme.colors.primary,
              }}
            />
          </AppPressable>
          <AppText color="secondary" variant="caption">
            16dp visually, 44dp tappable
          </AppText>
        </Row>
      </Stack>
    </Stack>
  );
};
