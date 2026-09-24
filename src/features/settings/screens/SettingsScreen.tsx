import { useNavigation } from '@react-navigation/native';

import {
  AppButton,
  AppScreen,
  AppText,
  Card,
  Chip,
  Divider,
  ListItem,
  Row,
  Stack,
} from '@components';
import { useSession } from '@store';
import { useTheme, type ThemePreference } from '@theme';

const PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

/** Structural placeholder demonstrating navigation and session use. */
export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useSession();
  const { preference, setPreference } = useTheme();

  return (
    <AppScreen scrollable testID="settings-screen">
      <Stack gap="xl">
        <AppText variant="heading1">Settings</AppText>

        <Card>
          <Stack gap="sm">
            <AppText variant="label">Theme</AppText>
            <Row gap="sm" wrap>
              {PREFERENCES.map(option => (
                <Chip
                  key={option}
                  label={option}
                  onPress={() => setPreference(option)}
                  selected={preference === option}
                />
              ))}
            </Row>
          </Stack>
        </Card>

        <Stack gap="none">
          <ListItem
            onPress={() =>
              navigation.navigate('App', {
                screen: 'Details',
                params: { id: 'from-settings' },
              })
            }
            subtitle="Pushes a typed detail route"
            testID="settings-open-details"
            title="Open details"
          />
          <Divider />
          <ListItem subtitle="Read-only row" title="About" />
        </Stack>

        <AppButton
          onPress={() => {
            signOut().catch(() => undefined);
          }}
          testID="sign-out"
          title="Sign out"
          variant="danger"
        />
      </Stack>
    </AppScreen>
  );
};
