import { useState } from 'react';

import { AppButton, AppInput, AppScreen, AppText, Stack } from '@components';
import { useSession } from '@store';

/**
 * Structural placeholder (AGENTS.md 2).
 *
 * The template ships the auth *navigation* shape, not an auth implementation.
 * There is no validation or request here on purpose; consumers replace the
 * body and keep the wiring.
 */
export const SignInScreen = () => {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = () => {
    setIsSubmitting(true);
    signIn().finally(() => setIsSubmitting(false));
  };

  return (
    <AppScreen testID="sign-in-screen">
      <Stack gap="xl" style={{ flex: 1, justifyContent: 'center' }}>
        <Stack gap="xs">
          <AppText variant="heading1">Sign in</AppText>
          <AppText color="secondary" variant="body">
            Placeholder screen. Replace the body, keep the navigation.
          </AppText>
        </Stack>

        <Stack gap="md">
          <AppInput
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            testID="sign-in-email"
            value={email}
          />
          <AppButton
            loading={isSubmitting}
            onPress={handleSignIn}
            testID="sign-in-submit"
            title="Continue"
          />
        </Stack>
      </Stack>
    </AppScreen>
  );
};
