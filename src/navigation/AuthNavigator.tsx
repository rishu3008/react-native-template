import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen, SignInScreen } from '@features/auth';
import { useTheme } from '@theme';

import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Routes reachable while signed out (AGENTS.md 25). */
export const AuthNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen
        component={SignInScreen}
        name="SignIn"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ForgotPasswordScreen}
        name="ForgotPassword"
        options={{ title: 'Reset password' }}
      />
    </Stack.Navigator>
  );
};
