import { AppText, Chip, Row, Stack } from '@components';
import { useBreakpoint } from '@hooks';
import { useTheme, type ThemePreference, type TypographyVariant } from '@theme';

const TYPOGRAPHY_VARIANTS: readonly TypographyVariant[] = [
  'display',
  'heading1',
  'heading2',
  'heading3',
  'body',
  'bodySmall',
  'caption',
  'label',
];

const THEME_PREFERENCES: readonly ThemePreference[] = [
  'system',
  'light',
  'dark',
];

export const HeaderSection = () => {
  const { mode } = useTheme();
  const { breakpoint, width, isLandscape } = useBreakpoint();

  return (
    <Stack gap="xs">
      <AppText variant="heading1">Design system</AppText>
      <AppText color="secondary" variant="bodySmall">
        {`${mode} theme · ${breakpoint} · ${Math.round(width)}dp · ${
          isLandscape ? 'landscape' : 'portrait'
        }`}
      </AppText>
    </Stack>
  );
};

export const ThemeSection = () => {
  const { preference, setPreference } = useTheme();

  return (
    <Stack gap="sm">
      <AppText variant="heading3">Theme</AppText>
      <Row gap="sm" wrap>
        {THEME_PREFERENCES.map(option => (
          <Chip
            key={option}
            label={option}
            onPress={() => setPreference(option)}
            selected={preference === option}
            testID={`theme-${option}`}
          />
        ))}
      </Row>
    </Stack>
  );
};

const WEIGHTS = ['regular', 'medium', 'semiBold', 'bold'] as const;

export const TypographySection = () => (
  <Stack gap="lg">
    <Stack gap="sm">
      <AppText variant="heading3">Typography</AppText>
      {TYPOGRAPHY_VARIANTS.map(variant => (
        <AppText key={variant} variant={variant}>
          {variant}
        </AppText>
      ))}
    </Stack>

    <Stack gap="sm">
      <AppText color="secondary" variant="label">
        Inter weights
      </AppText>
      {WEIGHTS.map(weight => (
        <AppText key={weight} variant="body" weight={weight}>
          {`${weight} - Inter-${weight.charAt(0).toUpperCase()}${weight.slice(1)}`}
        </AppText>
      ))}
      <AppText color="secondary" variant="caption">
        Each weight is a separate font file, so `weight` is a name rather than a
        number. React Native does not synthesise weights from one family.
      </AppText>
    </Stack>
  </Stack>
);

export const ColorsSection = () => {
  const { theme } = useTheme();

  const swatches = [
    ['primary', theme.colors.primary],
    ['error', theme.colors.error],
    ['success', theme.colors.success],
    ['warning', theme.colors.warning],
    ['border', theme.colors.border],
    ['surface', theme.colors.surfaceElevated],
  ] as const;

  return (
    <Stack gap="sm">
      <AppText variant="heading3">Semantic colours</AppText>
      <Row gap="sm" wrap>
        {swatches.map(([name, value]) => (
          <Stack gap="xxs" key={name}>
            <Stack
              style={{
                width: 64,
                height: 40,
                backgroundColor: value,
                borderRadius: theme.radius.md,
                borderWidth: theme.sizes.border.hairline,
                borderColor: theme.colors.border,
              }}
            />
            <AppText color="secondary" variant="caption">
              {name}
            </AppText>
          </Stack>
        ))}
      </Row>
    </Stack>
  );
};
