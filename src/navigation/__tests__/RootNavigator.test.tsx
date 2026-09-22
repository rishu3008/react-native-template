import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';

import App from '@app/App';
import { signInForTest, signOutForTest } from '@app/testing/session';
import { authService, sessionManager } from '@services';

/**
 * The navigation tree is mounted from session state, so these exercise the
 * whole app rather than the navigator in isolation -- mounting a navigator
 * without its providers would test a shape the app never renders.
 */
/**
 * Navigation transitions mount a whole screen tree, which regularly exceeds
 * RNTL's 1000ms default wait under Jest. These waits are given explicit
 * headroom rather than left to flake -- the default timing out is not a
 * finding about the app.
 */
const NAVIGATION_TIMEOUT = { timeout: 8000 };

describe('RootNavigator', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await signOutForTest();
    sessionManager.configure(authService);
    jest.restoreAllMocks();
  });

  it('swaps to the signed-in tree after signing in', async () => {
    // Stubbed at the service boundary, so everything above it -- session
    // manager, token storage, the navigation swap -- is the real path.
    jest.spyOn(authService, 'signIn').mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresAt: Date.now() + 3_600_000,
    });

    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('sign-in-screen');

    await user.press(screen.getByTestId('sign-in-submit'));

    expect(
      await screen.findByTestId('playground-screen', {}, NAVIGATION_TIMEOUT),
    ).toBeOnTheScreen();
  });

  it('tears the signed-in tree down on sign out', async () => {
    await signInForTest();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('playground-screen', {}, NAVIGATION_TIMEOUT);

    await user.press(screen.getByText('Settings'));
    await user.press(
      await screen.findByTestId('sign-out', {}, NAVIGATION_TIMEOUT),
    );

    // Auth and App are mounted conditionally rather than navigated between,
    // so signing out unmounts the authenticated tree instead of leaving the
    // previous user's screens alive underneath.
    expect(
      await screen.findByTestId('sign-in-screen', {}, NAVIGATION_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('playground-screen')).not.toBeOnTheScreen();
  });

  it('navigates to a typed detail route with an id', async () => {
    await signInForTest();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('playground-screen', {}, NAVIGATION_TIMEOUT);

    await user.press(screen.getByText('Settings'));
    await user.press(
      await screen.findByTestId(
        'settings-open-details',
        {},
        NAVIGATION_TIMEOUT,
      ),
    );

    expect(
      await screen.findByTestId('details-screen', {}, NAVIGATION_TIMEOUT),
    ).toBeOnTheScreen();
    expect(screen.getByText(/from-settings/)).toBeOnTheScreen();
  });
});
