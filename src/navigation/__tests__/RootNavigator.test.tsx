import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';

import App from '@app/App';
import { storageKeys } from '@constants';

/**
 * The navigation tree is mounted from session state, so these exercise the
 * whole app rather than the navigator in isolation -- mounting a navigator
 * without its providers would test a shape the app never renders.
 */
describe('RootNavigator', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('swaps to the signed-in tree after signing in', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('sign-in-screen');

    await user.press(screen.getByTestId('sign-in-submit'));

    expect(await screen.findByTestId('playground-screen')).toBeOnTheScreen();
  });

  it('tears the signed-in tree down on sign out', async () => {
    await AsyncStorage.setItem(storageKeys.session, 'active');
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('playground-screen');

    await user.press(screen.getByText('Settings'));
    await user.press(await screen.findByTestId('sign-out'));

    // Auth and App are mounted conditionally rather than navigated between,
    // so signing out unmounts the authenticated tree instead of leaving the
    // previous user's screens alive underneath.
    expect(await screen.findByTestId('sign-in-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('playground-screen')).not.toBeOnTheScreen();
  });

  it('navigates to a typed detail route with an id', async () => {
    await AsyncStorage.setItem(storageKeys.session, 'active');
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('playground-screen');

    await user.press(screen.getByText('Settings'));
    await user.press(await screen.findByTestId('settings-open-details'));

    expect(await screen.findByTestId('details-screen')).toBeOnTheScreen();
    expect(screen.getByText(/from-settings/)).toBeOnTheScreen();
  });
});
