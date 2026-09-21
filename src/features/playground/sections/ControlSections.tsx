import { useState } from 'react';

import {
  AppButton,
  AppInput,
  AppSwitch,
  AppText,
  Checkbox,
  Radio,
  Row,
  Stack,
} from '@components';

export const ButtonsSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Stack gap="sm">
      <AppText variant="heading3">Buttons</AppText>
      <AppButton onPress={() => undefined} title="Primary" />
      <AppButton
        onPress={() => undefined}
        title="Secondary"
        variant="secondary"
      />
      <AppButton onPress={() => undefined} title="Outline" variant="outline" />
      <AppButton onPress={() => undefined} title="Ghost" variant="ghost" />
      <AppButton onPress={() => undefined} title="Danger" variant="danger" />
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
  );
};

export const InputsSection = () => {
  const [email, setEmail] = useState('');

  const emailError =
    email.length > 0 && !email.includes('@')
      ? 'Enter a valid email'
      : undefined;

  return (
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
        error="Enter a valid email"
        label="Error state"
        onChangeText={() => undefined}
        required
        value="aaaaa"
      />
      <AppInput disabled label="Disabled" placeholder="Not editable" value="" />
    </Stack>
  );
};

export const SelectionSection = () => {
  const [agreed, setAgreed] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [notifications, setNotifications] = useState(true);

  return (
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
  );
};
