import {
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import { FullScreenLoader } from '@components';
import { useSession } from '@store';
import { useTheme } from '@theme';

import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { linking } from './linking';
import { navigationRef } from './navigationRef';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * The navigation tree responds to session state (AGENTS.md 25, brief 18).
 *
 * Auth and App are mounted conditionally rather than navigated between. A
 * signed-out user has no back route into the app, and signing out unmounts
 * the authenticated tree along with any state it held -- which is the point:
 * navigating from App to Auth would leave the previous user's screens alive
 * underneath.
 */
export const RootNavigator = () => {
  const { theme, mode } = useTheme();
  const { status } = useSession();

  // React Navigation keeps its own theme for the surfaces it draws itself --
  // headers, tab bars, the container background. Deriving it from the app
  // theme stops the two drifting apart on a theme switch.
  const navigationTheme = useMemo<NavigationTheme>(
    () => ({
      dark: mode === 'dark',
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text.primary,
        border: theme.colors.border,
        notification: theme.colors.error,
      },
      fonts: {
        regular: { fontFamily: '', fontWeight: '400' },
        medium: { fontFamily: '', fontWeight: '500' },
        bold: { fontFamily: '', fontWeight: '600' },
        heavy: { fontFamily: '', fontWeight: '700' },
      },
    }),
    [theme, mode],
  );

  // Nothing is rendered until the session is known. Treating `restoring` as
  // signed out would flash the sign-in screen at every returning user.
  if (status === 'restoring') {
    return <FullScreenLoader label="Loading" />;
  }

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {status === 'authenticated' ? (
          <Stack.Screen component={AppNavigator} name="App" />
        ) : (
          <Stack.Screen component={AuthNavigator} name="Auth" />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
