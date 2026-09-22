import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { signInForTest, signOutForTest } from '@app/testing/session';
import { AppButton } from '@components';
import { authService, sessionManager, tokenManager } from '@services';
import { SessionProvider, useSession } from '@store';

const Probe = () => {
  const { status, signIn, signOut } = useSession();

  return (
    <>
      <Text testID="status">{status}</Text>
      <AppButton
        onPress={() => {
          signIn('a@example.com', 'pw').catch(() => undefined);
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

const tokens = (
  overrides: Partial<Parameters<typeof tokenManager.save>[0]> = {},
) => ({
  accessToken: 'access',
  refreshToken: 'refresh',
  expiresAt: Date.now() + 3_600_000,
  ...overrides,
});

describe('SessionProvider', () => {
  beforeEach(async () => {
    await signOutForTest();
    sessionManager.configure(authService);
    jest.restoreAllMocks();
  });

  it('resolves to unauthenticated when there are no tokens', async () => {
    renderProbe();

    expect(await screen.findByText('unauthenticated')).toBeOnTheScreen();
  });

  it('restores a stored session', async () => {
    await signInForTest();

    renderProbe();

    expect(await screen.findByText('authenticated')).toBeOnTheScreen();
  });

  it('signs in through the session manager', async () => {
    jest.spyOn(authService, 'signIn').mockResolvedValue(tokens());
    const user = userEvent.setup();
    renderProbe();
    await screen.findByText('unauthenticated');

    await user.press(screen.getByTestId('sign-in'));

    expect(await screen.findByText('authenticated')).toBeOnTheScreen();
    expect(authService.signIn).toHaveBeenCalledWith({
      email: 'a@example.com',
      password: 'pw',
    });
  });

  it('signs out even when the server call fails', async () => {
    await signInForTest();
    jest
      .spyOn(authService, 'signOut')
      .mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    renderProbe();
    await screen.findByText('authenticated');

    await user.press(screen.getByTestId('sign-out'));

    // Sign-out is local-authoritative: a failed revoke must not strand the
    // user in a session they asked to end.
    expect(await screen.findByText('unauthenticated')).toBeOnTheScreen();
    expect(await tokenManager.load()).toBeNull();
  });

  it('opens the gate when the keychain is unreadable', async () => {
    jest
      .spyOn(tokenManager, 'load')
      .mockRejectedValue(new Error('keychain locked'));

    renderProbe();

    // The app must not hang on the loader because storage failed.
    expect(await screen.findByText('unauthenticated')).toBeOnTheScreen();
  });
});
