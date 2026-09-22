import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppButton } from '@components';
import { storageKeys } from '@constants';
import { SessionProvider, useSession } from '@store';

const Probe = () => {
  const { status, signIn, signOut } = useSession();

  return (
    <>
      <Text testID="status">{status}</Text>
      <AppButton
        onPress={() => {
          signIn().catch(() => undefined);
        }}
        testID="sign-in"
        title="in"
      />
      <AppButton
        onPress={() => {
          signOut().catch(() => undefined);
        }}
        testID="sign-out"
        title="out"
      />
    </>
  );
};

const renderProbe = () =>
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );

describe('SessionProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('resolves to unauthenticated when nothing is stored', async () => {
    renderProbe();

    expect(await screen.findByText('unauthenticated')).toBeOnTheScreen();
  });

  it('restores an existing session', async () => {
    await AsyncStorage.setItem(storageKeys.session, 'active');

    renderProbe();

    expect(await screen.findByText('authenticated')).toBeOnTheScreen();
  });

  it('persists on sign in and clears on sign out', async () => {
    const user = userEvent.setup();
    renderProbe();
    await screen.findByText('unauthenticated');

    await user.press(screen.getByTestId('sign-in'));
    expect(await screen.findByText('authenticated')).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(storageKeys.session)).toBe('active');

    await user.press(screen.getByTestId('sign-out'));
    expect(await screen.findByText('unauthenticated')).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(storageKeys.session)).toBeNull();
  });

  it('treats unreadable storage as no session rather than crashing', async () => {
    jest
      .mocked(AsyncStorage.getItem)
      .mockRejectedValueOnce(new Error('storage unavailable'));

    renderProbe();

    expect(await screen.findByText('unauthenticated')).toBeOnTheScreen();
  });
});
