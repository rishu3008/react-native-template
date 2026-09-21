import { useState } from 'react';

import {
  AppButton,
  AppInput,
  AppScreen,
  AppSwitch,
  AppText,
  Avatar,
  Badge,
  Card,
  Checkbox,
  Chip,
  Divider,
  ListItem,
  Radio,
  Row,
  Stack,
} from '@components';
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

/**
 * Visual test surface for the design system (brief section 39).
 *
 * Exercises every component in both themes. It is the template's own
 * playground, not an example feature, and is removed by consumers.
 */
export const PlaygroundScreen = () => {
  const { theme, mode, preference, setPreference } = useTheme();
  const { breakpoint, width, isLandscape } = useBreakpoint();

  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [notifications, setNotifications] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError =
    email.length > 0 && !email.includes('@')
      ? 'Enter a valid email'
      : undefined;

  return (
    <AppScreen scrollable testID="playground-screen">
      <Stack gap="xl">
        <Stack gap="xs">
          <AppText variant="heading1">Design system</AppText>
          <AppText color="secondary" variant="bodySmall">
            {`${mode} theme · ${breakpoint} · ${Math.round(width)}dp · ${
              isLandscape ? 'landscape' : 'portrait'
            }`}
          </AppText>
        </Stack>

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

        <Divider />

        <Stack gap="sm">
          <AppText variant="heading3">Typography</AppText>
          {TYPOGRAPHY_VARIANTS.map(variant => (
            <AppText key={variant} variant={variant}>
              {variant}
            </AppText>
          ))}
        </Stack>

        <Divider />

        <Stack gap="sm">
          <AppText variant="heading3">Buttons</AppText>
          <AppButton onPress={() => undefined} title="Primary" />
          <AppButton
            onPress={() => undefined}
            title="Secondary"
            variant="secondary"
          />
          <AppButton
            onPress={() => undefined}
            title="Outline"
            variant="outline"
          />
          <AppButton onPress={() => undefined} title="Ghost" variant="ghost" />
          <AppButton
            onPress={() => undefined}
            title="Danger"
            variant="danger"
          />
          <AppButton disabled onPress={() => undefined} title="Disabled" />
          <AppButton
            loading={isSubmitting}
            onPress={() => {
              setIsSubmitting(true);
              setTimeout(() => setIsSubmitting(false), 1500);
            }}
            testID="loading-button"
            title="Tap to load"
          />
          <Row gap="sm">
            <AppButton onPress={() => undefined} size="small" title="Small" />
            <AppButton onPress={() => undefined} size="medium" title="Medium" />
          </Row>
        </Stack>

        <Divider />

        <Stack gap="md">
          <AppText variant="heading3">Inputs</AppText>
          <AppInput
            autoCapitalize="none"
            error={emailError}
            helperText="We never share your address."
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            required
            testID="email-input"
            value={email}
          />
          <AppInput
            disabled
            label="Disabled"
            placeholder="Not editable"
            value=""
          />
        </Stack>

        <Divider />

        <Stack gap="md">
          <AppText variant="heading3">Selection</AppText>
          <Checkbox
            checked={agreed}
            label="I agree to the terms"
            onChange={setAgreed}
            testID="terms-checkbox"
          />
          <Radio
            label="Free plan"
            onSelect={() => setPlan('free')}
            selected={plan === 'free'}
          />
          <Radio
            label="Pro plan"
            onSelect={() => setPlan('pro')}
            selected={plan === 'pro'}
          />
          <AppSwitch
            label="Push notifications"
            onValueChange={setNotifications}
            value={notifications}
          />
        </Stack>

        <Divider />

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

        <Divider />

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

        <Stack gap="sm">
          <AppText variant="heading3">Semantic colours</AppText>
          <Row gap="sm" wrap>
            {(
              [
                ['primary', theme.colors.primary],
                ['error', theme.colors.error],
                ['success', theme.colors.success],
                ['warning', theme.colors.warning],
                ['border', theme.colors.border],
                ['surface', theme.colors.surfaceElevated],
              ] as const
            ).map(([name, value]) => (
              <Stack gap="xxs" key={name}>
                <Card padding="none" shadow="none">
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
                </Card>
                <AppText color="secondary" variant="caption">
                  {name}
                </AppText>
              </Stack>
            ))}
          </Row>
        </Stack>
      </Stack>
    </AppScreen>
  );
};
