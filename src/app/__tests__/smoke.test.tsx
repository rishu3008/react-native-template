import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';

import App from '@app/App';
import { signInForTest, signOutForTest } from '@app/testing/session';
import { storageKeys } from '@constants';
import { authService, sessionManager } from '@services';

/**
 * Template smoke test (brief section 38).
 *
 * Launch -> theme -> navigation -> modal -> bottom sheet -> input, driven
 * through the real app rather than mounted pieces. Its job is to fail loudly
 * when a phase breaks another phase's wiring: the providers, the session
 * gate, the navigation tree and the overlay portals all have to be correct
 * for it to pass.
 */
const NAV = { timeout: 8000 };

describe('template smoke test', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await signOutForTest();
    sessionManager.configure(authService);
    jest.restoreAllMocks();
  });

  it('launches, signs in, themes, navigates and opens overlays', async () => {
    const user = userEvent.setup();
    jest.spyOn(authService, 'signIn').mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresAt: Date.now() + 3_600_000,
    });

    // 1. Launch: the app renders the signed-out tree once both the theme
    //    preference and the session have resolved.
    render(<App />);
    expect(
      await screen.findByTestId('sign-in-screen', {}, NAV),
    ).toBeOnTheScreen();

    // 2. Sign in: the navigation tree swaps rather than pushing a route.
    await user.press(screen.getByTestId('sign-in-submit'));
    expect(
      await screen.findByTestId('playground-screen', {}, NAV),
    ).toBeOnTheScreen();

    // 3. Theme: an explicit choice is applied and persisted.
    await user.press(screen.getByTestId('theme-dark'));
    expect(await AsyncStorage.getItem(storageKeys.themePreference)).toBe(
      'dark',
    );

    // 4. Input: typing reaches component state and drives validation.
    //    Asserted on the field's own invalid state rather than the message,
    //    because the playground also renders a statically errored field with
    //    the same copy.
    const email = screen.getByTestId('email-input');
    await user.type(email, 'not-an-email');
    expect(email.props['aria-invalid']).toBe(true);

    // 5. Modal: opens over the screen and closes again.
    await user.press(screen.getByTestId('open-modal'));
    expect(
      await screen.findByTestId('playground-modal', {}, NAV),
    ).toBeOnTheScreen();
    await user.press(screen.getByTestId('app-modal-close'));

    // 6. Bottom sheet: the adapter is driven by `visible`, so this asserts
    //    the declarative-to-imperative bridge is still wired.
    await user.press(screen.getByTestId('open-sheet'));
    expect(
      await screen.findByTestId('playground-sheet', {}, NAV),
    ).toBeOnTheScreen();
  }, 30000);

  it('restores a signed-in session straight to the app tree', async () => {
    await signInForTest();

    render(<App />);

    // A returning user never sees the sign-in screen.
    expect(
      await screen.findByTestId('playground-screen', {}, NAV),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('sign-in-screen')).not.toBeOnTheScreen();
  }, 20000);
});
