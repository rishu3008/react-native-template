import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppScreen, AppText, Stack } from '@components';
import type { AuthStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

/**
 * Structural placeholder that demonstrates a typed route param.
 *
 * `route.params` is typed from AuthStackParamList, so reading a param the
 * route does not declare fails the typecheck rather than arriving undefined
 * at runtime (rule 25).
 */
export const ForgotPasswordScreen = ({ route }: Props) => (
  <AppScreen testID="forgot-password-screen">
    <Stack gap="md">
      <AppText variant="heading2">Reset password</AppText>
      <AppText color="secondary" variant="body">
        {route.params?.email != null
          ? `A link would be sent to ${route.params.email}.`
          : 'This route accepts an optional email param.'}
      </AppText>
    </Stack>
  </AppScreen>
);
