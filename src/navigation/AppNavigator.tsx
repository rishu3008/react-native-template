import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppText } from '@components';
import { DetailsScreen } from '@features/home';
import { PlaygroundScreen } from '@features/playground';
import { SettingsScreen } from '@features/settings';
import { useTheme } from '@theme';

import type { AppStackParamList, AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Tab icons are text placeholders.
 *
 * The template does not ship an icon set -- consumers bring their own and
 * render them with AppIcon. Using text here keeps the navigation shape
 * complete without imposing an icon library (rule 4).
 */
const TabIcon = ({ label, color }: { label: string; color: string }) => (
  <AppText style={{ color }} variant="caption">
    {label}
  </AppText>
);

// Defined at module scope, not inline in screenOptions: a renderer created
// during render is a new component type each pass, and React would remount the
// icon rather than update it.
const renderHomeIcon = ({ color }: { color: string }) => (
  <TabIcon color={color} label="◎" />
);

const renderSettingsIcon = ({ color }: { color: string }) => (
  <TabIcon color={color} label="⚙" />
);

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text.primary,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
      <Tab.Screen
        component={PlaygroundScreen}
        name="Home"
        options={{
          headerShown: false,
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        component={SettingsScreen}
        name="Settings"
        options={{
          headerShown: false,
          tabBarIcon: renderSettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

/** Routes reachable while signed in. */
export const AppNavigator = () => {
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
        component={TabNavigator}
        name="Tabs"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={DetailsScreen}
        name="Details"
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
};
