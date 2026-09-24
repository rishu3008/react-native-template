import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider } from '@app/providers';
import { AppPressable } from '@components';
import { storageKeys } from '@constants';
import { useTheme } from '@theme';

const Probe = () => {
  const { mode, preference, setPreference, isHydrated } = useTheme();

  if (!isHydrated) {
    return <Text testID="state">hydrating</Text>;
  }

  return (
    <>
      <Text testID="state">{`${preference}:${mode}`}</Text>
      <AppPressable onPress={() => setPreference('dark')} testID="go-dark">
        <Text>dark</Text>
      </AppPressable>
    </>
  );
};

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );

describe('ThemeProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('defaults to following the system appearance', async () => {
    renderProbe();

    // useColorScheme returns null under test, which resolves to light.
    expect(await screen.findByText('system:light')).toBeOnTheScreen();
  });

  it('persists an explicit choice', async () => {
    const user = userEvent.setup();
    renderProbe();
    await screen.findByTestId('go-dark');

    await user.press(screen.getByTestId('go-dark'));

    expect(await screen.findByText('dark:dark')).toBeOnTheScreen();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      storageKeys.themePreference,
      'dark',
    );
  });

  it('restores a previously stored preference', async () => {
    await AsyncStorage.setItem(storageKeys.themePreference, 'dark');

    renderProbe();

    expect(await screen.findByText('dark:dark')).toBeOnTheScreen();
  });

  it('ignores an unrecognised stored value rather than applying it', async () => {
    await AsyncStorage.setItem(storageKeys.themePreference, 'solarized');

    renderProbe();

    // Falls back to the default instead of trusting the stored string.
    expect(await screen.findByText('system:light')).toBeOnTheScreen();
  });

  it('still opens the hydration gate when storage is unreadable', async () => {
    jest
      .mocked(AsyncStorage.getItem)
      .mockRejectedValueOnce(new Error('storage unavailable'));

    renderProbe();

    await act(async () => {});

    expect(await screen.findByTestId('state')).not.toHaveTextContent(
      'hydrating',
    );
  });
});
